/**
 * Soul Elements — Analyze API Route
 * POST /api/analyze
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
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

    // Validate birthTime format (HH:MM) or empty/null
    if (birthTime && !birthTime.match(/^\d{2}:\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid birthTime. Use HH:MM format (e.g., 14:30).' });
    }

    // Validate latitude range
    if (latitude !== undefined && latitude !== null && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
      return res.status(400).json({ error: 'Invalid latitude. Must be a number between -90 and 90.' });
    }

    // Validate longitude range
    if (longitude !== undefined && longitude !== null && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
      return res.status(400).json({ error: 'Invalid longitude. Must be a number between -180 and 180.' });
    }

    // Validate gender
    if (gender && !['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be "male" or "female".' });
    }

    // Validate goal length (if provided)
    if (goal && typeof goal === 'string' && goal.length >= 100) {
      return res.status(400).json({ error: 'Invalid goal. Must be under 100 characters.' });
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
  return 'rep_' + crypto.randomUUID().split('-')[0] + Date.now().toString(36);
}

module.exports = router;
