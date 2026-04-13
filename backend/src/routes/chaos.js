const express = require('express');
const router = express.Router();

// Global chaos state
let chaosState = {
  isLatencyActive: false,
  isErrorsActive: false
};

// Toggle latency mode
router.post('/latency', (req, res) => {
  chaosState.isLatencyActive = !chaosState.isLatencyActive;
  res.json({ isLatencyActive: chaosState.isLatencyActive });
});

// Toggle errors mode
router.post('/errors', (req, res) => {
  chaosState.isErrorsActive = !chaosState.isErrorsActive;
  res.json({ isErrorsActive: chaosState.isErrorsActive });
});

module.exports = { router, chaosState };
