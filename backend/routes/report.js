/**
 * Soul Elements — Report Route
 * 
 * GET  /api/report/:sessionId     — Returns BaZi data + generated report content
 * GET  /api/report/:sessionId/pdf — Generates and downloads PDF report
 * POST /api/report/pre-generate   — Store report data after analysis
 * POST /api/report/generate       — Direct content generation
 */

const express = require('express');
const router = express.Router();
const { generateFullReport } = require('../lib/reportContent');
const { generatePDF } = require('../lib/pdf/pdfGenerator');

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

// GET /api/report/:sessionId — Fetch report content
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

// GET /api/report/:sessionId/pdf — Download PDF
router.get('/:sessionId/pdf', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const tier = req.query.tier || 'standard';

    const stored = reportStore.get(sessionId);
    if (!stored) {
      return res.status(404).json({ success: false, error: 'Report data not found or expired.' });
    }

    const { data } = stored;

    if (!data || !data.bazi) {
      return res.status(400).json({ success: false, error: 'Invalid report data.' });
    }

    const bazi = data.bazi;
    const goal = data.goal || 'all';
    const fullReport = generateFullReport(bazi, goal, tier);

    // Ensure percentages exist for PDF
    if (!bazi.fiveElements || !bazi.fiveElements.percentages) {
      const chart = bazi.fiveElements?.chart || {};
      bazi.fiveElements = bazi.fiveElements || {};
      bazi.fiveElements.percentages = chart;
    }

    // console.log(`Generating PDF for session ${sessionId} (${tier})...`);

    // Generate PDF using PDFKit
    const pdfBuffer = await generatePDF(
      { bazi, tier },
      fullReport,
      tier
    );

    // console.log(`PDF generated: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="soul-elements-destiny-audit-${tier}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF: ' + error.message });
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
    console.error('Failed to store report data:', error);
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

// POST /api/report/generate-pdf — Generate PDF from bazi data directly (for testing)
router.post('/generate-pdf', async (req, res) => {
  try {
    const { bazi, goal, tier } = req.body;
    if (!bazi || !bazi.pillars) {
      return res.status(400).json({ success: false, error: 'Invalid BaZi data.' });
    }

    // Ensure percentages exist for PDF
    if (!bazi.fiveElements || !bazi.fiveElements.percentages) {
      const chart = bazi.fiveElements?.chart || {};
      bazi.fiveElements = bazi.fiveElements || {};
      bazi.fiveElements.percentages = chart;
    }

    const fullReport = generateFullReport(bazi, goal || 'all', tier || 'standard');
    const pdfBuffer = await generatePDF({ bazi, tier }, fullReport, tier || 'standard');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="soul-elements-test.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF: ' + error.message });
  }
});

module.exports = { router, reportStore };
