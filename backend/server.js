const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { metricsMiddleware, register } = require('./src/middleware/metrics');
const habitRoutes = require('./src/routes/habits');
const { router: chaosRoutes, chaosState } = require('./src/routes/chaos');
const seedDB = require('./src/seed');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/habitflow';

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware); // MUST be before chaos so metrics track the simulated slowness/errors

// SRE Chaos Engineering Middleware
app.use((req, res, next) => {
  // Never disrupt metrics or the chaos API itself
  if (req.path === '/metrics' || req.path.startsWith('/api/chaos')) {
    return next();
  }

  // 1. Simulate 500 Errors
  if (chaosState.isErrorsActive) {
    // 50% chance to fail
    if (Math.random() > 0.5) {
      return res.status(500).json({ error: "SRE Simulated Error" });
    }
  }

  // 2. Simulate High Latency (3 seconds)
  if (chaosState.isLatencyActive) {
    return setTimeout(() => {
      next();
    }, 3000);
  }

  next();
});

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/chaos', chaosRoutes);

// Metrics Endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
    await seedDB(); // Run seed after successful connection
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry logic could be added here, but Docker compose `depends_on` and `restart: always` handles this usually.
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
