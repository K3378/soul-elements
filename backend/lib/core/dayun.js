/**
 * Soul Elements — Da Yun (大運) Calculator
 * 
 * Calculates 10-year luck cycles with proper jieqi-based starting age.
 * 
 * Algorithm:
 * 1. Determine direction (forward/reverse) based on gender + Day Master polarity
 *    - Yang Male or Yin Female → forward (順排)
 *    - Yin Male or Yang Female → reverse (逆排)
 * 2. Find the nearest jie (節, not 氣):
 *    - Forward: next jie after birth
 *    - Reverse: previous jie before birth
 * 3. Count days from birth to that jie
 * 4. Starting age = days / 3 (1 day = 4 months of luck)
 * 5. Generate 8 luck pillars (80 years)
 */

const { Solar, Lunar } = require('lunar-javascript');

// Heavenly Stems order
const STEM_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// Earthly Branches order
const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// English names for Heavenly Stems
const STEM_EN = {
  '甲': { en: 'Jia', element: 'Wood', polar: 'Yang' },
  '乙': { en: 'Yi', element: 'Wood', polar: 'Yin' },
  '丙': { en: 'Bing', element: 'Fire', polar: 'Yang' },
  '丁': { en: 'Ding', element: 'Fire', polar: 'Yin' },
  '戊': { en: 'Wu', element: 'Earth', polar: 'Yang' },
  '己': { en: 'Ji', element: 'Earth', polar: 'Yin' },
  '庚': { en: 'Geng', element: 'Metal', polar: 'Yang' },
  '辛': { en: 'Xin', element: 'Metal', polar: 'Yin' },
  '壬': { en: 'Ren', element: 'Water', polar: 'Yang' },
  '癸': { en: 'Gui', element: 'Water', polar: 'Yin' },
};

// English names for Earthly Branches
const BRANCH_EN = {
  '子': { en: 'Zi', animal: 'Rat' },
  '丑': { en: 'Chou', animal: 'Ox' },
  '寅': { en: 'Yin', animal: 'Tiger' },
  '卯': { en: 'Mao', animal: 'Rabbit' },
  '辰': { en: 'Chen', animal: 'Dragon' },
  '巳': { en: 'Si', animal: 'Snake' },
  '午': { en: 'Wu', animal: 'Horse' },
  '未': { en: 'Wei', animal: 'Goat' },
  '申': { en: 'Shen', animal: 'Monkey' },
  '酉': { en: 'You', animal: 'Rooster' },
  '戌': { en: 'Xu', animal: 'Dog' },
  '亥': { en: 'Hai', animal: 'Pig' },
};

// Element mapping for stems
const STEM_TO_ELEMENT = {
  '甲': 'Wood', '乙': 'Wood',
  '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

/**
 * Check if a Heavenly Stem is Yang
 * @param {string} stem - Heavenly stem character
 * @returns {boolean}
 */
function isStemYang(stem) {
  const idx = STEM_ORDER.indexOf(stem);
  return idx % 2 === 0; // 甲(0)=Yang, 乙(1)=Yin
}

/**
 * Get Solar date from YMD string
 */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Solar.fromYmd(y, m, d);
}

/**
 * Calculate starting age for Da Yun using jieqi boundaries
 * 
 * @param {number} direction - 1 for forward, -1 for reverse
 * @param {Solar} birthSolar - Solar object for birth date
 * @returns {number} Starting age in years (with decimal)
 */
function calculateStartingAge(birthSolar, direction) {
  const birthLunar = birthSolar.getLunar();
  
  let targetJie;
  if (direction === 1) {
    // Forward: next jie after birth
    targetJie = birthLunar.getNextJie();
  } else {
    // Reverse: previous jie before birth
    targetJie = birthLunar.getPrevJie();
  }

  const jieSolar = targetJie.getSolar();
  const birthJD = birthSolar.getJulianDay();
  const jieJD = jieSolar.getJulianDay();

  // Days from birth to jie
  const daysToJie = Math.abs(jieJD - birthJD);

  // Starting age = days / 3
  // (1 day = 4 months in traditional calculation)
  const startingAge = daysToJie / 3;

  return {
    startingAge,
    daysToJie: Math.round(daysToJie * 100) / 100,
    jieName: targetJie.getName(),
    jieDate: jieSolar.toYmd(),
    jieTime: `${String(jieSolar.getHour()).padStart(2, '0')}:${String(jieSolar.getMinute()).padStart(2, '0')}`,
  };
}

/**
 * Calculate Da Yun (大運) — 10-year luck cycles
 * 
 * @param {Object} params
 * @param {string} params.gender - 'male' or 'female'
 * @param {string} params.dayMasterStem - Heavenly stem of Day Pillar (e.g., '癸')
 * @param {string} params.monthStem - Heavenly stem of Month Pillar
 * @param {string} params.monthBranch - Earthly branch of Month Pillar
 * @param {string} params.birthDate - 'YYYY-MM-DD'
 * @returns {Object} Da Yun data with luck pillars
 */
function calculateDaYun(params) {
  const { gender, dayMasterStem, monthStem, monthBranch, birthDate } = params;

  if (!gender || gender === '') {
    return {
      startingAge: 0,
      direction: 'N/A',
      directionNote: 'Gender required for Da Yun calculation.',
      pillars: [],
    };
  }

  // Step 1: Determine direction
  const dmYang = isStemYang(dayMasterStem);
  const isMale = gender === 'male';
  const isForward = (isMale && dmYang) || (!isMale && !dmYang);
  const direction = isForward ? 1 : -1;

  // Step 2: Calculate starting age using jieqi
  const birthSolar = parseDate(birthDate);
  const ageResult = calculateStartingAge(birthSolar, direction);

  // Step 3: Generate 8 luck pillars (80 years)
  const monthStemIdx = STEM_ORDER.indexOf(monthStem);
  const monthBranchIdx = BRANCH_ORDER.indexOf(monthBranch);

  const luckPillars = [];

  for (let i = 0; i < 8; i++) {
    // Luck stem: month stem + (direction * (i+1))
    let luckStemIdx = (monthStemIdx + direction * (i + 1)) % 10;
    if (luckStemIdx < 0) luckStemIdx += 10;
    const luckStem = STEM_ORDER[luckStemIdx];

    // Luck branch: month branch + (direction * (i+1))
    let luckBranchIdx = (monthBranchIdx + direction * (i + 1)) % 12;
    if (luckBranchIdx < 0) luckBranchIdx += 12;
    const luckBranch = BRANCH_ORDER[luckBranchIdx];

    // Age range for this pillar
    const ageStart = Math.round(ageResult.startingAge) + (i * 10);
    const ageEnd = ageStart + 9;

    // Estimate year range (rough approximation based on current year)
    // For a real implementation, we'd calculate exact year from birth year + age
    const yearStart = ''; // Calculated dynamically in report

    luckPillars.push({
      pillar: i + 1,
      stem: luckStem,
      stemEn: STEM_EN[luckStem]?.en || luckStem,
      stemElement: STEM_TO_ELEMENT[luckStem] || 'Unknown',
      branch: luckBranch,
      branchEn: BRANCH_EN[luckBranch]?.en || luckBranch,
      branchAnimal: BRANCH_EN[luckBranch]?.animal || luckBranch,
      ageRange: `${ageStart}-${ageEnd}`,
    });
  }

  return {
    startingAge: Math.round(ageResult.startingAge * 10) / 10,
    startingAgeRounded: Math.round(ageResult.startingAge),
    direction: isForward ? 'Forward' : 'Reverse',
    directionChinese: isForward ? '順排' : '逆排',
    directionNote: isForward
      ? 'Yang Male / Yin Female — Luck moves forward through the months.'
      : 'Yin Male / Yang Female — Luck moves in reverse through the months.',
    calculationDetail: {
      daysToJie: ageResult.daysToJie,
      jieName: ageResult.jieName,
      jieDate: ageResult.jieDate,
      jieTime: ageResult.jieTime,
      formula: `${ageResult.daysToJie} days ÷ 3 = ${(ageResult.startingAge).toFixed(1)} years`,
    },
    pillars: luckPillars,
  };
}

/**
 * Get the current luck pillar for a given age
 * @param {Object} daYunData - Output from calculateDaYun
 * @param {number} age - Current age
 * @returns {Object|null} Current luck pillar
 */
function getCurrentLuckPillar(daYunData, age) {
  if (!daYunData || !daYunData.pillars) return null;
  for (const pillar of daYunData.pillars) {
    const [start, end] = pillar.ageRange.split('-').map(Number);
    if (age >= start && age <= end) return pillar;
  }
  return null;
}

module.exports = {
  calculateDaYun,
  getCurrentLuckPillar,
  isStemYang,
};
