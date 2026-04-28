/**
 * Soul Elements — Analyze API Route
 * POST /api/analyze
 */

const express = require('express');
const router = express.Router();
const { getEnglishBazi, getEnglishBaziWithTier } = require('../lib/baziEngine');

router.post('/analyze', (req, res) => {
  try {
    const {
      birthDate,      // 'YYYY-MM-DD'
      birthTime,      // 'HH:mm'
      latitude,       // number
      longitude,      // number
      timezone,       // string like 'Asia/Hong_Kong'
      timezoneOffset, // number like 8
      gender,         // 'male' | 'female' | 'non-binary'
      goal,           // 'career' | 'love' | 'peace' | 'all'
      unknownTime,    // boolean
    } = req.body;

    // Validation
    if (!birthDate || !birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid birthDate. Use YYYY-MM-DD format.' });
    }

    let effectiveTime = birthTime;
    let effectiveLongitude = longitude;
    let effectiveOffset = timezoneOffset;

    if (unknownTime || !birthTime) {
      effectiveTime = '12:00';
    }

    if (!longitude || !timezoneOffset) {
      effectiveLongitude = 0;
      effectiveOffset = 0;
    }

    // Get full BaZi analysis with all advanced calculations
    const baziResult = getEnglishBaziWithTier(
      birthDate,
      effectiveTime,
      effectiveLongitude,
      effectiveOffset,
      gender || ''
    );

    // Preview text (locked content indicator)
    const preview = {
      soulElement: `Your core identity is ${baziResult.dayMaster.element} — ${baziResult.dayMaster.archetype}. ${baziResult.dayMaster.keywords}.`,
      personality: `As a ${baziResult.dayMaster.element} individual, you embody the essence of ${baziResult.dayMaster.archetype.toLowerCase()}...`,
      energyHint: `Your cosmic energy is dominated by the elements that shape your destiny.`,
    };

    res.json({
      success: true,
      isPremium: false,
      reportId: generateId(),
      bazi: baziResult,
      preview,
      accuracyNote: baziResult.accuracyNote,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze birth chart.' });
  }
});

function generateId() {
  return 'rep_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

module.exports = router;
