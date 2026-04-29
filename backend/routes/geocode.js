/**
 * Soul Elements — Geocode API Route
 * POST /api/geocode
 *
 * Converts a city name to lat/lng coordinates, display name, and timezone info.
 */

const express = require('express');
const router = express.Router();

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const TIMEZONE_API = 'https://timeapi.io/api/TimeZone/coordinate';

/**
 * Parse a timezone name (e.g. 'Asia/Hong_Kong') into its current UTC offset in hours.
 */
function getTimezoneOffset(timezone) {
  try {
    const now = new Date();
    const localeString = now.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'longOffset' });
    const match = localeString.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const sign = hours < 0 ? -1 : 1;
      return hours + (sign * minutes / 60);
    }
    return 0;
  } catch {
    return 0;
  }
}

router.post('/geocode', async (req, res) => {
  try {
    const { city } = req.body;

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return res.status(400).json({ error: 'City is required.' });
    }

    // Query Nominatim
    const params = new URLSearchParams({
      q: city.trim(),
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': 'SoulElements/1.0 (backend)' },
    });

    if (!response.ok) {
      console.error('Nominatim error:', response.status, response.statusText);
      return res.status(502).json({ error: 'Geocoding service unavailable.' });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `City "${city}" not found.` });
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const displayName = result.display_name;

    // Get timezone from coordinates using free timeapi.io
    let timezone = 'UTC';
    let timezoneOffset = 0;
    try {
      const tzUrl = `${TIMEZONE_API}?latitude=${lat}&longitude=${lng}`;
      const tzRes = await fetch(tzUrl, { signal: AbortSignal.timeout(5000) });
      if (tzRes.ok) {
        const tzData = await tzRes.json();
        timezone = tzData.timeZone || tzData.ianaTimeZone || 'UTC';
        timezoneOffset = tzData.currentUtcOffset?.seconds 
          ? tzData.currentUtcOffset.seconds / 3600 
          : getTimezoneOffset(timezone);
      } else {
        // Fallback: calculate rough offset from longitude
        timezoneOffset = Math.round(lng / 15);
        timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
      }
    } catch {
      // Fallback: approximate from longitude
      timezoneOffset = Math.round(lng / 15);
      timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
    }

    res.json({
      success: true,
      data: {
        lat,
        lng,
        displayName,
        timezone,
        timezoneOffset,
      },
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: 'Failed to geocode city.' });
  }
});

module.exports = router;
