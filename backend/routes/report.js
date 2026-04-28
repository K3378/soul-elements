/**
 * Soul Elements — Report Data Store
 * 
 * In-memory store keyed by Stripe session ID.
 * GET /api/report/:sessionId — returns stored report data after payment
 * POST /api/report/store — stores report data before payment (called by preview page checkout)
 */

const express = require('express');
const router = express.Router();

// Simple in-memory store
const reportStore = new Map();

// Cleanup old entries after 1 hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of reportStore.entries()) {
    if (now - entry.timestamp > 3600000) {
      reportStore.delete(key);
    }
  }
}, 600000);

/**
 * POST /api/report/store — store report data before redirecting to Stripe
 * Body: { sessionId, reportData }
 */
router.post('/store', (req, res) => {
  try {
    const { sessionId, reportData } = req.body;
    if (!sessionId || !reportData) {
      return res.status(400).json({ error: 'Missing sessionId or reportData' });
    }
    reportStore.set(sessionId, {
      data: reportData,
      timestamp: Date.now(),
    });
    console.log(`📦 Report data stored for session: ${sessionId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Report store error:', error);
    res.status(500).json({ error: 'Failed to store report data' });
  }
});

/**
 * GET /api/report/:sessionId — retrieve report data after payment
 * Returns the full bazi analysis data
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const entry = reportStore.get(sessionId);

    if (!entry) {
      return res.status(404).json({ error: 'Report data not found. It may have expired.' });
    }

    console.log(`📖 Report data retrieved for session: ${sessionId}`);
    res.json({ success: true, data: entry.data });
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve report data' });
  }
});

module.exports = router;
module.exports.reportStore = reportStore;
