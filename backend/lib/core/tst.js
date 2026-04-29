/**
 * Soul Elements — True Solar Time (TST) Calculator
 * 
 * Implements Meeus-based Equation of Time calculation for precise
 * True Solar Time correction based on birth longitude.
 * 
 * Reference: Jean Meeus, "Astronomical Algorithms" (2nd Ed.)
 * Accuracy: ~±30 seconds
 */

/**
 * Calculate the Equation of Time using Meeus algorithm
 * @param {number} year - Year (e.g., 1997)
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @returns {number} Equation of Time in minutes (range: ~-16 to ~+16)
 */
function meeusEquationOfTime(year, month, day) {
  // Julian Day Number
  const jd = calculateJulianDay(year, month, day);

  // Time T (Julian centuries since J2000.0)
  const T = (jd - 2451545.0) / 36525;

  // Mean longitude of the Sun (L0) in degrees
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // Mean anomaly of the Sun (M) in degrees
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  // Eccentricity of Earth's orbit (e)
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Obliquity of the ecliptic (epsilon) in degrees
  const epsilon = 23.439291 - 0.0130042 * T;

  // Sun's equation of the center (C) in degrees
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
    + 0.000289 * Math.sin(3 * M * Math.PI / 180);

  // Sun's true longitude (sunLongitude) in degrees
  const sunLongitude = L0 + C;

  // Sun's right ascension (alpha) in degrees
  // alpha = atan2(cos(epsilon) * sin(sunLongitude), cos(sunLongitude))
  const alpha = Math.atan2(
    Math.cos(epsilon * Math.PI / 180) * Math.sin(sunLongitude * Math.PI / 180),
    Math.cos(sunLongitude * Math.PI / 180)
  ) * 180 / Math.PI;

  // Normalize alpha to [0, 360)
  let alphaNorm = alpha;
  if (alphaNorm < 0) alphaNorm += 360;

  // Normalize L0 to [0, 360)
  let L0norm = L0 % 360;
  if (L0norm < 0) L0norm += 360;

  // Equation of Time in degrees: E = L0 - 0.0057183 - alpha
  // (0.0057183° = nutation correction)
  let E = L0norm - 0.0057183 - alphaNorm;

  // Normalize E to [-180, 180]
  if (E > 180) E -= 360;
  if (E < -180) E += 360;

  // Convert to minutes (1° = 4 minutes)
  const eotMinutes = E * 4;

  // Sanity check: EOT should be between -20 and +20 minutes
  if (eotMinutes > 20 || eotMinutes < -20) {
    // Fallback to simplified Fourier approximation
    return fourierEquationOfTime(day, month, year);
  }

  return Math.round(eotMinutes * 100) / 100;
}

/**
 * Simplified Fourier-based EOT approximation (backup)
 * Accuracy: ~±2 minutes
 */
function fourierEquationOfTime(day, month, year) {
  const d = new Date(year, month - 1, day);
  const startOfYear = new Date(year, 0, 0);
  const dayOfYear = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24));

  const B = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/**
 * Calculate Julian Day Number
 */
function calculateJulianDay(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (y + 4716))
    + Math.floor(30.6001 * (m + 1))
    + day + B - 1524.5;
}

/**
 * Get timezone center meridian
 */
function getTimezoneMeridian(timezoneOffset) {
  return timezoneOffset * 15;
}

/**
 * Calculate True Solar Time correction
 */
function getTrueSolarTimeCorrection(longitude, timezoneOffset, dateObj) {
  const timezoneMeridian = getTimezoneMeridian(timezoneOffset);
  const longitudeCorrection = (longitude - timezoneMeridian) * 4;

  const year = dateObj.getFullYear ? dateObj.getFullYear() : dateObj.year;
  const month = dateObj.getMonth ? dateObj.getMonth() + 1 : dateObj.month;
  const day = dateObj.getDate ? dateObj.getDate() : dateObj.day;

  // Try Meeus first, fall back to Fourier
  const eotMinutes = meeusEquationOfTime(year, month, day);

  const totalCorrection = longitudeCorrection + eotMinutes;

  return {
    totalMinutes: Math.round(totalCorrection * 10) / 10,
    longitudeCorrection: Math.round(longitudeCorrection * 10) / 10,
    equationOfTime: Math.round(eotMinutes * 10) / 10,
    timezoneMeridian,
    totalHours: Math.round((totalCorrection / 60) * 100) / 100,
    description: generateCorrectionDescription(longitudeCorrection, eotMinutes, totalCorrection),
  };
}

/**
 * Apply TST correction to a time
 */
function applyTrueSolarTime(dateStr, timeStr, longitude, timezoneOffset) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);

  const correction = getTrueSolarTimeCorrection(
    longitude,
    timezoneOffset,
    { year: y, month: m, day: d }
  );

  const originalTotalMinutes = h * 60 + min;
  const correctedTotalMinutes = originalTotalMinutes + correction.totalMinutes;

  // Proper date arithmetic using JS Date (handles month/year rollover correctly)
  const dateObj = new Date(y, m - 1, d, 0, 0, 0);
  dateObj.setMinutes(correctedTotalMinutes);

  const correctedYear = dateObj.getFullYear();
  const correctedMonth = dateObj.getMonth() + 1;
  const correctedDay = dateObj.getDate();
  const correctedHours = dateObj.getHours();
  const correctedMins = dateObj.getMinutes();

  const correctedDate = `${String(correctedYear).padStart(4, '0')}-${String(correctedMonth).padStart(2, '0')}-${String(correctedDay).padStart(2, '0')}`;
  const correctedTime = `${String(correctedHours).padStart(2, '0')}:${String(correctedMins).padStart(2, '0')}`;

  const didCrossDate = correctedDay !== d;

  return {
    correctedDate,
    correctedTime,
    didCrossDate,
    correction,
  };
}

function generateCorrectionDescription(longCorr, eot, total) {
  const parts = [];
  if (Math.abs(longCorr) > 0.5) {
    parts.push(`${Math.abs(Math.round(longCorr))} min longitude adjustment`);
  }
  if (Math.abs(eot) > 0.5) {
    parts.push(`${Math.abs(Math.round(eot))} min Equation of Time adjustment`);
  }

  if (parts.length === 0) return 'No significant correction needed.';

  const dir = total > 0 ? 'forward' : 'backward';
  return `Your birth time was adjusted ${dir} by ${Math.abs(Math.round(total))} minutes (${parts.join(', ')}).`;
}

module.exports = {
  getTrueSolarTimeCorrection,
  applyTrueSolarTime,
  meeusEquationOfTime,
  calculateJulianDay,
  getTimezoneMeridian,
};
