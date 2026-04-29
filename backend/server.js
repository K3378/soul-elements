/**
 * Soul Elements — Unified Server
 * 
 * Serves both the Express API and Next.js static frontend export.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Frontend static files (Next.js export with trailingSlash)
const frontendDir = path.join(__dirname, '..', 'frontend', 'out');

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ========== Stripe Webhook (raw body needed — must be before express.json()) ==========
const webhookRouter = require('./routes/webhook');
app.use('/webhook/stripe', webhookRouter);

// ========== JSON parser for all other routes ==========
app.use(express.json());

// ========== API Routes ==========
const analyzeRouter = require('./routes/analyze');
const stripeRouter = require('./routes/stripe');
const { router: reportRouter } = require('./routes/report');
const geocodeRouter = require('./routes/geocode');

app.use('/api', analyzeRouter);
app.use('/api', stripeRouter);
app.use('/api/report', reportRouter);
app.use('/api', geocodeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== Frontend Static Files ==========
// Serve Next.js static assets (JS, CSS, images) with long cache
app.use('/_next', express.static(path.join(frontendDir, '_next'), {
  maxAge: '1y',
  immutable: true,
}));

// Serve root-level static assets (favicon, svg, etc.)
app.use(express.static(frontendDir, {
  maxAge: '1h',
}));

// SPA-style fallback: for /input, /preview, /report, serve their index.html
app.get('/input*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'input', 'index.html'));
});

app.get('/preview*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'preview', 'index.html'));
});

app.get('/report*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'report', 'index.html'));
});

// Redirect plain / to index
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== Start ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Soul Elements running on port ${PORT}`);
  console.log(`Frontend: ${frontendDir}`);
  console.log(`Health: http://0.0.0.0:${PORT}/health`);
});
