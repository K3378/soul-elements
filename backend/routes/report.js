/**
 * Soul Elements — Report Route
 * 
 * GET /api/report/:sessionId
 * - Returns BaZi data + generated report content
 */

const express = require('express');
const router = express.Router();
const { generateFullReport } = require('../lib/reportContent');

// In-memory report store
const reportStore = new Map();

// Clean up expired reports (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of reportStore.entries()) {
    if (now - value.timestamp > 24 * 60 * 60 * 1000) {
      reportStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// GET /api/report/:sessionId
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const tier = req.query.tier || 'standard';

    const stored = reportStore.get(sessionId);
    if (!stored) {
      return res.status(404).json({ success: false, error: 'Report data not found or expired. Please complete payment again.' });
    }

    const { data } = stored;

    if (!data || !data.bazi) {
      return res.status(400).json({ success: false, error: 'Invalid report data.' });
    }

    // Generate the full report content for the specified tier
    const bazi = data.bazi;
    const goal = data.goal || 'all';
    const fullReport = generateFullReport(bazi, goal, tier);

    res.json({
      success: true,
      tier,
      data: {
        bazi,
        report: fullReport,
      },
    });
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to load report.' });
  }
});

// POST /api/report/pre-generate (called after analysis to store result)
router.post('/pre-generate', (req, res) => {
  try {
    const { sessionId, data } = req.body;
    if (sessionId && data) {
      reportStore.set(sessionId, {
        data,
        timestamp: Date.now(),
      });
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Missing sessionId or data.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to store report data.' });
  }
});

// POST /api/report/generate (direct content generation, no session needed)
router.post('/generate', (req, res) => {
  try {
    const { bazi, goal, tier } = req.body;
    if (!bazi || !bazi.pillars) {
      return res.status(400).json({ success: false, error: 'Invalid BaZi data.' });
    }
    const fullReport = generateFullReport(bazi, goal || 'all', tier || 'standard');
    res.json({
      success: true,
      data: { bazi, report: fullReport },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report.' });
  }
});

module.exports = { router, reportStore };
