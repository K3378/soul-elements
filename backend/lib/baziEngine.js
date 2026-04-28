/**
 * Soul Elements — BaZi Engine
 * 
 * Core calculation engine with True Solar Time correction.
 * Handles: 排盤 (pillar calculation), 五行統計, 十神 mapping
 */

const { Solar, Lunar, EightChar } = require('lunar-javascript');
const { DateTime } = require('luxon');
const {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  TEN_GODS,
  FIVE_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
} = require('./translationMap');

/**
 * Calculate True Solar Time correction
 * Formula: correction = (longitude - timezoneMeridian) * 4 + equationOfTime
 * 
 * @param {number} longitude - Birth location longitude (e.g. 114.17 for HK)
 * @param {number} timezoneOffset - Timezone offset in hours (e.g. 8 for HK)
 * @returns {number} Correction in minutes
 */
function getTrueSolarTimeCorrection(longitude, timezoneOffset) {
  // Step 1: Longitude correction (±4 min per degree from timezone center meridian)
  const timezoneMeridian = timezoneOffset * 15;
  const longitudeCorrection = (longitude - timezoneMeridian) * 4;
  
  // Step 2: Equation of Time correction (±16 min max)
  // Using an approximation based on the day of year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  
  // Fourier approximation of EOT (accuracy ~±2 min)
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  return longitudeCorrection + equationOfTime;
}

/**
 * Calculate BaZi pillars from birth date/time
 * 
 * @param {string} dateStr - Date string 'YYYY-MM-DD'
 * @param {string} timeStr - Time string 'HH:mm'
 * @param {number} longitude - Birth longitude
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Object} English BaZi result
 */
function getEnglishBazi(dateStr, timeStr, longitude, timezoneOffset) {
  // Step 1: Apply True Solar Time correction
  const correctionMinutes = getTrueSolarTimeCorrection(longitude, timezoneOffset);
  
  const inputDt = DateTime.fromISO(`${dateStr}T${timeStr}`, { zone: `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}` });
  const correctedDt = inputDt.plus({ minutes: Math.round(correctionMinutes) });
  
  const correctedDate = correctedDt.toFormat('yyyy-MM-dd');
  const correctedTime = correctedDt.toFormat('HH:mm');
  
  // Step 2: Calculate BaZi using lunar-javascript
  const solar = Solar.fromYmd(
    parseInt(correctedDate.split('-')[0]),
    parseInt(correctedDate.split('-')[1]),
    parseInt(correctedDate.split('-')[2])
  );
  
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  // Step 3: Extract pillars using correct API
  // Year pillar comes from the original EightChar (based on solar date)
  // But month/day/time need the corrected time's lunar calculation
  const yearPillar = {
    stem: eightChar.getYearGan(),
    branch: eightChar.getYearZhi(),
  };
  
  // For month, day, and time pillars, recalculate using corrected time
  const correctedSolar = Solar.fromYmdHms(
    parseInt(correctedDate.split('-')[0]),
    parseInt(correctedDate.split('-')[1]),
    parseInt(correctedDate.split('-')[2]),
    parseInt(correctedTime.split(':')[0]),
    parseInt(correctedTime.split(':')[1]),
    0
  );
  const correctedLunar = correctedSolar.getLunar();
  const correctedEightChar = correctedLunar.getEightChar();
  
  const monthPillar = {
    stem: correctedEightChar.getMonthGan(),
    branch: correctedEightChar.getMonthZhi(),
  };
  const dayPillar = {
    stem: correctedEightChar.getDayGan(),
    branch: correctedEightChar.getDayZhi(),
  };
  const hourPillar = {
    stem: correctedEightChar.getTimeGan(),
    branch: correctedEightChar.getTimeZhi(),
  };
  
  // Step 4: Translate to English
  const translatePillar = (pillar) => {
    const stemEn = HEAVENLY_STEMS[pillar.stem] || { en: pillar.stem, element: pillar.stem, archetype: pillar.stem };
    const branchEn = EARTHLY_BRANCHES[pillar.branch] || { en: pillar.branch, animal: pillar.branch };
    return {
      stem: pillar.stem,         // Chinese original (for chart)
      stemEn: stemEn.en,          // e.g. 'Jia'
      stemElement: stemEn.element, // e.g. 'Yang Wood'
      branch: pillar.branch,
      branchEn: branchEn.en,
      animal: branchEn.animal,    // e.g. 'Rat'
    };
  };
  
  const pillars = {
    year: translatePillar(yearPillar),
    month: translatePillar(monthPillar),
    day: translatePillar(dayPillar),
    hour: translatePillar(hourPillar),
  };
  
  // Step 5: Five Element analysis (basic — stems + branch main energy)
  const elementCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // Chinese to English element mapping
  const ELEMENT_EN = { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' };
  
  // Count from stems
  const allStems = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const stemToElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  
  allStems.forEach(stem => {
    const elem = stemToElement[stem];
    if (elem) elementCount[elem]++;
  });
  
  // Count from branches (main hidden stem energy)
  const allBranches = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
  const branchMainElement = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  
  allBranches.forEach(branch => {
    const elem = branchMainElement[branch];
    if (elem) elementCount[elem]++;
  });
  
  // Calculate percentages (English keys)
  const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
  const elementPercentages = {};
  Object.entries(elementCount).forEach(([elem, count]) => {
    elementPercentages[ELEMENT_EN[elem]] = Math.round((count / total) * 100);
  });
  
  // Step 6: Day Master info
  const dayMaster = HEAVENLY_STEMS[dayPillar.stem] || { en: dayPillar.stem, element: dayPillar.stem, archetype: dayPillar.stem, keywords: '' };
  
  // Step 7: Return result
  return {
    trueSolarTime: {
      originalTime: timeStr,
      correctedTime: correctedTime,
      correctionMinutes: Math.round(correctionMinutes * 10) / 10,
      note: correctionMinutes !== 0 
        ? `Your birth time was adjusted by ${Math.abs(Math.round(correctionMinutes))} minutes for True Solar Time accuracy based on your birth location.`
        : 'No adjustment needed.',
    },
    pillars,
    dayMaster: {
      stem: dayPillar.stem,
      en: dayMaster.en,
      element: dayMaster.element,
      archetype: dayMaster.archetype,
      keywords: dayMaster.keywords,
    },
    fiveElements: {
      raw: elementCount,
      percentages: elementPercentages,
      chart: elementPercentages, // Frontend will render the chart
    },
    // Simplified: in Phase 2 we'll add detailed ten god analysis
    accuracyNote: longitude && timezoneOffset !== undefined
      ? 'Precise — True Solar Time applied with Equation of Time correction.'
      : 'Approximate — no birth location provided. Accuracy may vary.',
  };
}

/**
 * Generate AI content prompt for full report
 * This provides structured data for the content generation step
 * 
 * @param {Object} baziResult - Result from getEnglishBazi()
 * @param {string} goal - User's selected goal (career/love/peace)
 * @param {string} tier - 'standard' or 'grandMaster'
 * @returns {Object} Content template with sections
 */
function getReportContentTemplate(baziResult, goal, tier) {
  const dm = baziResult.dayMaster;
  
  return {
    intro: {
      title: `Your Soul Element: ${dm.archetype}`,
      subtitle: `${dm.element} — ${dm.keywords}`,
    },
    sections: [
      {
        id: 'personality',
        title: 'Your Core Identity',
        element: dm.element,
        archetype: dm.archetype,
      },
      {
        id: 'energyChart',
        title: 'Your Cosmic Energy Distribution',
        elements: baziResult.fiveElements.percentages,
      },
      {
        id: 'lifePath',
        title: 'Your Life Path & Opportunities',
        goal: goal,
      },
    ],
    tier: tier,
    isPremium: tier === 'grandMaster',
  };
}

module.exports = {
  getEnglishBazi,
  getTrueSolarTimeCorrection,
  getReportContentTemplate,
};
