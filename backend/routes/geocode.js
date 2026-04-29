/**
 * Soul Elements — Geocode API Route
 * POST /api/geocode
 *
 * Converts a city name to lat/lng coordinates, display name, and timezone info.
 */

const express = require('express');
const router = express.Router();
const geoTz = require('geo-tz');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Parse a timezone name (e.g. 'Asia/Hong_Kong') into its current UTC offset in hours.
 */
function getTimezoneOffset(timezone) {
  try {
    const now = new Date();
    const localeString = now.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'longOffset' });
    // Extract offset from strings like 'GMT+8:00', 'GMT-5:00', 'GMT+5:30', 'GMT+0:00'
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
      headers: {
        'User-Agent': 'SoulElements/1.0 (backend)',
      },
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

    // Get timezone from coordinates
    const timezones = geoTz.find(lat, lng);
    const timezone = timezones && timezones.length > 0 ? timezones[0] : 'UTC';
    const timezoneOffset = getTimezoneOffset(timezone);

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
