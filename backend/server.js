/**
 * Soul Elements — Main Server Entry
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const analyzeRouter = require('./routes/analyze');
app.use('/api', analyzeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe webhook (raw body needed for signature verification)
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  // Phase 1: Placeholder — Kevin will setup Stripe products
  res.json({ received: true });
});

// Report status endpoint (placeholder)
app.get('/api/report/status', (req, res) => {
  res.json({ status: 'ready', message: 'Report generation endpoint ready.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Soul Elements API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
