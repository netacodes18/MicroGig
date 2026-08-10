const { client, isRedisConnected } = require('../config/redis');

// Normalizes and sorts query parameters to ensure consistent cache keys
const sortQueryString = (query) => {
  const sorted = {};
  Object.keys(query).sort().forEach(key => {
    sorted[key] = query[key];
  });
  return JSON.stringify(sorted);
};

// Reusable cache middleware with fail-soft fallback to MongoDB
const cacheMiddleware = (durationSeconds, prefix) => {
  return async (req, res, next) => {
    if (!isRedisConnected()) {
      return next();
    }

    try {
      const sortedQueryString = sortQueryString(req.query);
      const key = `${prefix}:${req.baseUrl + req.path}:${sortedQueryString}`;

      // Query Redis for existing cached response
      const cachedResponse = await client.get(key);
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
          client.setEx(key, durationSeconds, JSON.stringify(body))
            .catch(err => console.error(`[Redis Error] Failed to write cache key ${key}:`, err.message));
        }

        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      console.error('[Redis Cache Middleware Exception]:', err.message);
      next();
    }
  };
};

// Non-blocking key deletion using SCAN and UNLINK
const clearCachePattern = async (pattern) => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    let cursor = '0';
    let deletedCount = 0;

    do {
      const reply = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });

      // Node-redis v4 returns scan results as an object with cursor and keys
      cursor = String(reply.cursor);
      const keys = reply.keys;

      if (keys && keys.length > 0) {
        // UNLINK is non-blocking on Redis main thread, falling back to DEL
        if (typeof client.unlink === 'function') {
          await client.unlink(keys);
        } else {
          await client.del(keys);
        }
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    if (deletedCount > 0) {
      console.log(`[Cache Evict] Pattern "${pattern}" evicted ${deletedCount} keys.`);
    }
  } catch (err) {
    console.error(`[Redis Cache Eviction Error] Failed to clear pattern "${pattern}":`, err.message);
  }
};

module.exports = {
  cacheMiddleware,
  clearCachePattern
};
