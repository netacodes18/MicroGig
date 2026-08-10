const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let client = null;
let connected = false;

// Create the Redis client
client = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log('🛑 Redis reconnect attempts exhausted. Running in DB-only mode.');
        return new Error('Max retries reached');
      }
      console.log(`🔄 Redis Reconnecting attempt #${retries}`);
      return Math.min(retries * 100, 3000);
    }
  }
});

client.on('connect', () => {
  console.log('📡 Redis Client Handshake Connecting...');
});

client.on('ready', () => {
  connected = true;
  console.log('✅ Redis Connected');
});

// Suppress connection refused spam, only log other errors or log once
let hasLoggedError = false;
client.on('error', (err) => {
  connected = false;
  if (!hasLoggedError) {
    console.error('❌ Redis Client Error:', err.message);
    hasLoggedError = true;
  }
});

client.on('end', () => {
  connected = false;
  // console.log('🔌 Redis Client Connection Closed');
});

client.on('reconnecting', () => {
  // Silent to avoid spam
});

// Graceful shutdown helper
const handleShutdown = async () => {
  if (client) {
    console.log('🚪 Closing Redis connections gracefully...');
    try {
      await client.quit();
      console.log('✅ Redis connections closed.');
    } catch (err) {
      console.error('Error closing Redis client:', err);
    }
  }
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

const isRedisConnected = () => {
  return client !== null && connected && client.isOpen;
};

module.exports = {
  client,
  isRedisConnected
};
