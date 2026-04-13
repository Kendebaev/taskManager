const promClient = require('prom-client');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
promClient.collectDefaultMetrics({
  app: 'habitflow-backend',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Create a histogram for HTTP request durations (Latency)
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 5, 10]
});

// Create a counter for total HTTP requests (Traffic & Errors)
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);

// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
  // Ignore metrics endpoint
  if (req.path === '/metrics') {
    return next();
  }

  const startEpoch = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startEpoch) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Update histogram
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
      
    // Update counter
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = {
  metricsMiddleware,
  register
};
