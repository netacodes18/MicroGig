const { cacheGet, cacheSet, clearCachePattern } = require('../config/redis');

// Normalizes and sorts query parameters to ensure consistent cache keys
const sortQueryString = (query) => {
  const sorted = {};
  Object.keys(query).sort().forEach(key => {
    sorted[key] = query[key];
  });
  return JSON.stringify(sorted);
};

// Reusable cache middleware using Circuit Breaker
const cacheMiddleware = (durationSeconds, prefix) => {
  return async (req, res, next) => {
    try {
      const sortedQueryString = sortQueryString(req.query);
      const key = `${prefix}:${req.baseUrl + req.path}:${sortedQueryString}`;

      // Query Redis using Circuit Breaker wrapped get
      const cachedResponse = await cacheGet(key);
      if (cachedResponse) {
        console.log(`[Cache Hit] Key: ${key}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedResponse));
      }

      console.log(`[Cache Miss] Key: ${key}`);
      res.setHeader('X-Cache', 'MISS');

      // Override res.json to intercept and cache the response
      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson;

        // Cache only 2xx successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(key, JSON.stringify(body), durationSeconds)
            .catch(err => console.error(`[Redis Error] Failed to write cache key ${key}:`, err.message));
        }

        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      // With the circuit breaker's fallback(() => null), this catch block
      // will rarely be hit for Redis issues, but we keep it for general safety.
      console.error('[Cache Middleware Exception]:', err.message);
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  clearCachePattern // Re-exported so controllers don't need to change imports
};
