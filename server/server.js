const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { register, metricsMiddleware } = require('./middleware/metrics');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Middleware
app.use(metricsMiddleware);
app.use(compression());
app.use(limiter);

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.FRONTEND_URL,
    'https://gigly.vercel.app',
    'https://micro-gig-azure.vercel.app'
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MicroGig API is running' });
});

// Global error handler
app.use(require('./middleware/errorHandler'));

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Job = require('./models/Job');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const { client: redisClient } = require('./config/redis');
  // Start redis connection in background so it doesn't block server startup
  redisClient.connect().catch(err => {
    console.error('❌ Redis failed to connect on startup, running in DB-only mode:', err.message);
  });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.FRONTEND_URL,
        'https://gigly.vercel.app',
        'https://micro-gig-azure.vercel.app'
      ].filter(Boolean),
      credentials: true,
    }
  });

  app.set('io', io);

  // Socket Auth Middleware
  io.use((socket, next) => {
    try {
      let token = null;
      // 1. Check handshake auth payload
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }
      // 2. Check cookies
      if (!token && socket.handshake.headers.cookie) {
        // Simple manual cookie parsing for microgig_token
        const cookies = socket.handshake.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, val] = cookie.trim().split('=');
          if (name === 'microgig_token') {
            token = val;
            break;
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user.id})`);

    socket.on('join-workspace', async (jobId) => {
      try {
        const job = await Job.findById(jobId).select('poster assignedTo');
        if (!job) {
          return socket.emit('error', 'Job not found');
        }

        const userId = socket.user.id;
        const isPoster = job.poster && job.poster.toString() === userId;
        const isAssigned = job.assignedTo && job.assignedTo.toString() === userId;

        if (isPoster || isAssigned) {
          socket.join(jobId);
          console.log(`User ${userId} joined workspace room: ${jobId}`);
        } else {
          socket.emit('error', 'Not authorized to join this workspace');
        }
      } catch (err) {
        console.error('Socket join-workspace error:', err);
        socket.emit('error', 'Internal server error');
      }
    });

    socket.on('leave-workspace', (jobId) => {
      socket.leave(jobId);
      console.log(`User ${socket.user.id} left workspace room: ${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server (HTTP & WebSockets) running on port ${PORT}`);
  });
};

startServer();
