const client = require('prom-client');

// Create a Registry to register custom metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'gigly-backend'
});

// Enable default system metrics (CPU, Memory, Event Loop Lag, Heap, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'gigly_'
});

// Custom Metric 1: Total HTTP requests counter
const httpRequestCounter = new client.Counter({
  name: 'gigly_http_requests_total',
  help: 'Total number of HTTP requests processed by Gigly server',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Custom Metric 2: HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'gigly_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 3, 5]
});
register.registerMetric(httpRequestDuration);

// Custom Metric 3: Active HTTP requests gauge
const activeRequestsGauge = new client.Gauge({
  name: 'gigly_http_active_requests',
  help: 'Number of currently active in-flight HTTP requests'
});
register.registerMetric(activeRequestsGauge);

/**
 * Normalize parameterized route URLs to avoid high cardinality metrics.
 * E.g., /api/jobs/65b1c8f49e01... -> /api/jobs/:id
 */
const normalizeRoute = (req) => {
  if (req.route && req.route.path) {
    const baseUrl = req.baseUrl || '';
    return (baseUrl + req.route.path).replace(/\/+/g, '/');
  }
  // Fallback for paths without route match or regex replacements for 24-char hex ObjectIDs
  let path = req.originalUrl || req.url || '/';
  path = path.split('?')[0]; // strip query string
  return path.replace(/\/[a-f0-9]{24}/gi, '/:id');
};

/**
 * Express middleware to observe metrics on every HTTP request
 */
const metricsMiddleware = (req, res, next) => {
  // Ignore /metrics endpoint itself to keep metrics clean
  if (req.path === '/metrics' || req.path === '/api/metrics') {
    return next();
  }

  const startTime = process.hrtime();
  activeRequestsGauge.inc();

  res.on('finish', () => {
    activeRequestsGauge.dec();

    const diff = process.hrtime(startTime);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = normalizeRoute(req);
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    const labels = {
      method: req.method,
      route: route,
      status_code: statusCode
    };

    httpRequestCounter.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  client
};
