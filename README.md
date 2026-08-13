# 🚀 MicroGig (Gigly)

MicroGig is a full-stack, real-time freelance marketplace that connects clients with skilled freelancers. It features real-time project workspaces, secure payment integrations, Redis caching for high performance, and comprehensive Prometheus observability.

## 🔗 Links
- **Live Deployment**: [https://gigly.vercel.app](https://gigly.vercel.app)
- **Alternate Link**: [https://micro-gig-azure.vercel.app](https://micro-gig-azure.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **React 19 & Vite**: Lightning-fast modern UI.
- **Tailwind CSS**: Utility-first styling.
- **Framer Motion**: Smooth micro-interactions and transitions.
- **Socket.io-client**: Real-time bidding and workspace messaging.

### Backend
- **Node.js & Express**: High-performance REST API.
- **MongoDB & Mongoose**: Flexible document schema with middleware hooks for caching.
- **Socket.io**: WebSockets for real-time workspaces.
- **Redis**: Read-through cache layer for optimized database load.
- **Razorpay**: Escrow and milestone payments integration.
- **Prometheus (prom-client)**: Advanced API observability (metrics exposed at `/metrics`).

## ✨ Key Features
- **Real-Time Workspaces**: Secure, job-specific WebSocket rooms for freelancers and clients to communicate instantly.
- **Escrow & Payments**: Seamless integration with Razorpay to track payments across milestones (`PENDING`, `READY_FOR_RELEASE`, `RELEASED`).
- **Advanced Caching**: Mongoose lifecycle hooks automatically invalidate specific Redis caches (e.g., job lists) on updates or deletions.
- **Role-Based Data**: Single MongoDB `users` collection protected by robust Mongoose `pre('validate')` hooks to ensure freelancers don't store client data maliciously.
- **Built-in Observability**: Tracks RED (Rate, Errors, Duration) metrics using Prometheus `/metrics` endpoint.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Redis server
- Cloudinary, Razorpay, and Google OAuth credentials

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/netacodes18/MicroGig.git
   cd MicroGig
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   REDIS_URL=your_redis_url
   RAZORPAY_KEY_ID=your_key
   RAZORPAY_KEY_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_secret
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the App**
   ```bash
   # In the server directory
   npm run dev

   # In the client directory
   npm run dev
   ```

## 📈 Monitoring
This project exposes a `/metrics` endpoint on the backend for Prometheus to scrape, enabling real-time Grafana dashboards for API latencies and traffic monitoring.
