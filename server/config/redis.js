const redis = require('redis');
const CircuitBreaker = require('opossum');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_OP_TIMEOUT_MS = parseInt(process.env.REDIS_OP_TIMEOUT_MS || '1000', 10);
const CIRCUIT_BREAKER_VOLUME_THRESHOLD = parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '3', 10);
const CIRCUIT_BREAKER_ERROR_PCT = parseInt(process.env.CIRCUIT_BREAKER_ERROR_PCT || '100', 10);
const CIRCUIT_BREAKER_RESET_MS = parseInt(process.env.CIRCUIT_BREAKER_RESET_MS || '10000', 10);

// Create the Redis client with command timeouts matching the breaker timeout
const client = redis.createClient({
  url: redisUrl,
  socket: {
    connectTimeout: REDIS_OP_TIMEOUT_MS,
    reconnectStrategy: (retries) => {
      // Reconnect progressively up to 3 seconds apart
      return Math.min(retries * 100, 3000);
    }
  },
  commandsQueueMaxLength: 10000,
  disableOfflineQueue: true, // Fail fast if disconnected, don't queue indefinitely
  commandTimeout: REDIS_OP_TIMEOUT_MS // Sync Redis command timeout with breaker timeout
});

client.on('connect', () => console.log('📡 Redis Client Connecting...'));
client.on('ready', () => console.log('✅ Redis Connected'));

let hasLoggedError = false;
client.on('error', (err) => {
  if (!hasLoggedError) {
    console.error('❌ Redis Client Error:', err.message);
    hasLoggedError = true;
  }
});
client.on('reconnecting', () => { hasLoggedError = false; }); // Reset log on reconnect

// Graceful shutdown helper
const handleShutdown = async () => {
  if (client) {
    console.log('🚪 Closing Redis connections gracefully...');
    try {
      await client.quit();
    } catch (err) {}
  }
};
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// --- Circuit Breaker Setup ---

const breakerOptions = {
  timeout: REDIS_OP_TIMEOUT_MS,
  errorThresholdPercentage: CIRCUIT_BREAKER_ERROR_PCT,
  resetTimeout: CIRCUIT_BREAKER_RESET_MS,
  volumeThreshold: CIRCUIT_BREAKER_VOLUME_THRESHOLD
};

// Raw async functions to be wrapped
const _get = async (key) => {
  if (!client.isOpen) throw new Error('Redis client closed');
  return client.get(key);
};

const _set = async (key, value, options) => {
  if (!client.isOpen) throw new Error('Redis client closed');
  return client.set(key, value, options);
};

const _scanAndDelete = async (pattern) => {
  if (!client.isOpen) throw new Error('Redis client closed');
  let cursor = 0;
  do {
    const res = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = res.cursor;
    if (res.keys.length > 0) {
      await client.unlink(res.keys);
    }
  } while (cursor !== 0);
  return true;
};

// Wrap with Opossum
const getBreaker = new CircuitBreaker(_get, breakerOptions);
const setBreaker = new CircuitBreaker(_set, breakerOptions);
const scanBreaker = new CircuitBreaker(_scanAndDelete, breakerOptions);

// Setup logging and fallbacks for each breaker
[
  { name: 'GET', breaker: getBreaker },
  { name: 'SET', breaker: setBreaker },
  { name: 'SCAN', breaker: scanBreaker }
].forEach(({ name, breaker }) => {
  breaker.fallback(() => null); // Silent fallback on open/reject/failure
  
  breaker.on('open', () => console.warn(`🔴 Redis Circuit Breaker [${name}] OPENED (falling back to DB)`));
  breaker.on('halfOpen', () => console.log(`🟡 Redis Circuit Breaker [${name}] HALF-OPEN (testing recovery...)`));
  breaker.on('close', () => console.log(`🟢 Redis Circuit Breaker [${name}] CLOSED (recovered, cache active)`));
  breaker.on('reject', () => console.log(`🚫 Redis Circuit Breaker [${name}] REJECTED request (Fast-fail)`)); 
});

// Exported helper wrappers
const cacheGet = async (key) => {
  return getBreaker.fire(key);
};

const cacheSet = async (key, value, ttl = 3600) => {
  return setBreaker.fire(key, value, { EX: ttl });
};

const clearCachePattern = async (pattern) => {
  return scanBreaker.fire(pattern);
};

module.exports = {
  client, // Need to export client just for server.js to call .connect() on startup
  cacheGet,
  cacheSet,
  clearCachePattern
};
