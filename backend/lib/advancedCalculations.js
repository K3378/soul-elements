/**
 * Soul Elements — Advanced BaZi Calculations
 * 
 * Handles: Full Hidden Stems with 本氣/中氣/餘氣,
 * Ten Deities (十神), Da Yun (大運/10-year cycles),
 * Annual Forecast, Branch Interactions (刑沖破害)
 */

const { Solar, Lunar, EightChar } = require('lunar-javascript');
const {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  BRANCH_HIDDEN_STEMS,
  STEM_TO_ELEMENT,
  BRANCH_MAIN_ELEMENT,
  TEN_GODS,
  TEN_GOD_RULES,
  BRANCH_SIX_COMBINATIONS,
  BRANCH_TRIPLE_COMBINATIONS,
  BRANCH_SIX_CLASHES,
  BRANCH_THREE_PUNISHMENTS,
  BRANCH_SELF_PUNISHMENTS,
  GENERATING_CYCLE,
  CONTROLLING_CYCLE,
} = require('./translationMap');

// Heavenly Stem order index
const STEM_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Yin/Yang of stems: odd index = Yang, even index (0-indexed) -> 甲丙戊庚壬 = Yang
function isStemYang(stem) {
  const idx = STEM_ORDER.indexOf(stem);
  return idx % 2 === 0; // 甲(0)=Yang, 乙(1)=Yin, 丙(2)=Yang...
}

// Yin/Yang of branches
function isBranchYang(branch) {
  const idx = BRANCH_ORDER.indexOf(branch);
  return idx % 2 === 0; // 子(0)=Yang...
}

/**
 * Get full hidden stems for a branch
 * Returns array of stem chars with their depth (本氣=main, 中氣=secondary, 餘氣=residual)
 */
function getFullHiddenStems(branch) {
  const stems = BRANCH_HIDDEN_STEMS[branch] || [];
  return stems.map((stem, i) => ({
    stem,
    stemEn: HEAVENLY_STEMS[stem]?.en || stem,
    element: STEM_TO_ELEMENT[stem] || 'Unknown',
    depth: i === 0 ? 'main' : i === 1 ? 'secondary' : 'residual',
  }));
}

/**
 * Calculate Ten Deities (十神) for all pillars
 * Based on each heavenly stem's relationship to the Day Master
 */
function calculateTenDeities(dayMasterStem, pillars) {
  if (!dayMasterStem || !pillars) return {};

  const dmElement = STEM_TO_ELEMENT[dayMasterStem];
  const dmYang = isStemYang(dayMasterStem);

  const result = {};

  // Analyze each pillar's stem
  for (const [position, pillar] of Object.entries(pillars)) {
    if (!pillar || !pillar.stem) continue;

    const stemElement = STEM_TO_ELEMENT[pillar.stem];
    const stemYang = isStemYang(pillar.stem);

    // Skip Day Master pillar itself (that's 元男/元女)
    if (position === 'day') {
      result[position] = {
        stem: pillar.stem,
        stemEn: HEAVENLY_STEMS[pillar.stem]?.en || pillar.stem,
        tenGodCn: '元男',
        tenGodEn: 'The Self (Day Master)',
        element: stemElement,
        polarity: dmYang ? 'Yang' : 'Yin',
      };
      continue;
    }

    // Determine relationship: same element, generating, controlling, or nourishing
    let godKey = null;

    if (stemElement === dmElement) {
      // Same element: same polarity -> Peer, opposite -> Competitor
      godKey = (stemYang === dmYang) ? 'sameYin' : 'sameYang';
    } else if (GENERATING_CYCLE[dmElement] === stemElement) {
      // DM generates this stem: same polarity -> Creator, opposite -> Rebel Genius
      godKey = (stemYang === dmYang) ? 'generatesSame' : 'generatesOpp';
    } else if (CONTROLLING_CYCLE[dmElement] === stemElement) {
      // DM controls this stem: same polarity -> Warrior, opposite -> Authority
      godKey = (stemYang === dmYang) ? 'controlsSame' : 'controlsOpp';
    } else if (GENERATING_CYCLE[stemElement] === dmElement) {
      // Stem generates DM (stem nourishes DM): same -> Mystic, opposite -> Guardian
      godKey = (stemYang === dmYang) ? 'nourishesSame' : 'nourishesOpp';
    } else if (CONTROLLING_CYCLE[stemElement] === dmElement) {
      // Stem controls DM: same -> Steward, opposite -> Entrepreneur
      godKey = (stemYang === dmYang) ? 'controlledSame' : 'controlledOpp';
    }

    const tenGodCn = godKey ? TEN_GOD_RULES[godKey] : '正印';
    const tenGodInfo = TEN_GODS[tenGodCn] || { en: 'Unknown', subtitle: '', psychology: '' };

    result[position] = {
      stem: pillar.stem,
      stemEn: HEAVENLY_STEMS[pillar.stem]?.en || pillar.stem,
      tenGodCn,
      tenGodEn: tenGodInfo.en,
      tenGodSubtitle: tenGodInfo.subtitle,
      tenGodPsychology: tenGodInfo.psychology,
      element: stemElement,
      polarity: stemYang ? 'Yang' : 'Yin',
    };
  }

  return result;
}

/**
 * Calculate full 5-element counts including all hidden stems
 */
function calculateFullElementCounts(pillars, hiddenStems) {
  const counts = { 'Wood': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };
  const weights = { 'Wood': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };
  
  // Weight: 天干(4x), 地支本氣(3x), 中氣(2x), 餘氣(1x)

  // Count stems (weight 4)
  for (const [position, pillar] of Object.entries(pillars)) {
    if (pillar && pillar.stem) {
      const elem = STEM_TO_ELEMENT[pillar.stem];
      if (elem) {
        counts[elem]++;
        weights[elem] += 4;
      }
    }
  }

  // Count hidden stems from each branch
  for (const [position, pillar] of Object.entries(pillars)) {
    if (pillar && pillar.branch) {
      const hStems = getFullHiddenStems(pillar.branch);
      hStems.forEach(hs => {
        const elem = hs.element;
        if (elem) {
          counts[elem]++;
          const w = hs.depth === 'main' ? 3 : hs.depth === 'secondary' ? 2 : 1;
          weights[elem] += w;
        }
      });
    }
  }

  // Calculate weighted percentages
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const percentages = {};
  for (const [elem, w] of Object.entries(weights)) {
    percentages[elem] = totalWeight > 0 ? Math.round((w / totalWeight) * 100) : 0;
  }

  return { counts, weights, percentages };
}

/**
 * Calculate Hidden Stems for all pillars
 */
function calculateAllHiddenStems(pillars) {
  const result = {};
  for (const [position, pillar] of Object.entries(pillars)) {
    if (pillar && pillar.branch) {
      result[position] = {
        branch: pillar.branch,
        branchEn: EARTHLY_BRANCHES[pillar.branch]?.en || pillar.branch,
        hiddenStems: getFullHiddenStems(pillar.branch),
      };
    }
  }
  return result;
}

/**
 * Calculate Da Yun (大運) — 10-year luck cycles
 * 
 * For males: Yang male or Yin female = forward
 * For females: Yang female or Yin male = reverse
 * 
 * @param {string} gender - 'male' or 'female'
 * @param {string} dayMasterStem - Heavenly stem of the Day Pillar
 * @param {string} monthStem - Heavenly stem of the Month Pillar
 * @param {string} monthBranch - Earthly branch of the Month Pillar
 * @param {string} birthDate - YYYY-MM-DD
 * @param {string} birthTime - HH:mm
 * @param {number} longitude - birth longitude
 * @param {number} timezoneOffset - timezone offset
 */
function calculateDaYun(gender, dayMasterStem, monthStem, monthBranch, birthDate, birthTime, longitude, timezoneOffset) {
  if (!gender || gender === '') return [];

  const dmYang = isStemYang(dayMasterStem);
  const isMale = gender === 'male';
  
  // Determinate direction: Yang male or Yin female = forward; else reverse
  const isForward = (isMale && dmYang) || (!isMale && !dmYang);
  
  const monthStemIdx = STEM_ORDER.indexOf(monthStem);
  const monthBranchIdx = BRANCH_ORDER.indexOf(monthBranch);

  // Calculate starting age (起運歲數)
  // Simplified algorithm: based on remaining days to next/prev seasonal change
  // For a professional implementation we'd calculate exact jieqi boundaries
  const startingAge = 3; // Simplified: age 3 for demo; real implementation needs jieqi calculation
  
  // Generate 8 luck pillars (80 years worth)
  const luckPillars = [];
  for (let i = 0; i < 8; i++) {
    const step = isForward ? i : -i;
    
    // Calculate luck stem
    let luckStemIdx = (monthStemIdx + (isForward ? 1 : -1) * (i + 1)) % 10;
    if (luckStemIdx < 0) luckStemIdx += 10;
    const luckStem = STEM_ORDER[luckStemIdx];
    
    // Calculate luck branch
    let luckBranchIdx = (monthBranchIdx + (isForward ? 1 : -1) * (i + 1)) % 12;
    if (luckBranchIdx < 0) luckBranchIdx += 12;
    const luckBranch = BRANCH_ORDER[luckBranchIdx];
    
    const ageStart = startingAge + (i * 10);
    const ageEnd = ageStart + 9;
    const yearStart = new Date().getFullYear() + (ageStart - 30); // Estimate based on ~30 age
    const yearEnd = yearStart + 9;
    
    luckPillars.push({
      pillar: i + 1,
      stem: luckStem,
      stemEn: HEAVENLY_STEMS[luckStem]?.en || luckStem,
      stemElement: STEM_TO_ELEMENT[luckStem] || 'Unknown',
      branch: luckBranch,
      branchEn: EARTHLY_BRANCHES[luckBranch]?.en || luckBranch,
      branchAnimal: EARTHLY_BRANCHES[luckBranch]?.animal || luckBranch,
      ageRange: `${ageStart}-${ageEnd}`,
      yearRange: `${yearStart}-${yearEnd}`,
      direction: isForward ? 'Forward' : 'Reverse',
    });
  }

  return {
    startingAge,
    direction: isForward ? 'Forward (順排)' : 'Reverse (逆排)',
    pillars: luckPillars,
  };
}

/**
 * Calculate branch interactions (刑冲破害)
 */
function calculateBranchInteractions(pillars) {
  const branches = {
    year: pillars.year?.branch,
    month: pillars.month?.branch,
    day: pillars.day?.branch,
    hour: pillars.hour?.branch,
  };

  const interactions = [];
  const branchNames = ['year', 'month', 'day', 'hour'];

  // Check Six Clashes (六沖)
  for (let i = 0; i < branchNames.length; i++) {
    for (let j = i + 1; j < branchNames.length; j++) {
      const b1 = branches[branchNames[i]];
      const b2 = branches[branchNames[j]];
      if (!b1 || !b2) continue;

      // Check for clash
      const isClash = BRANCH_SIX_CLASHES.some(pair => 
        (pair[0] === b1 && pair[1] === b2) || (pair[0] === b2 && pair[1] === b1)
      );
      if (isClash) {
        interactions.push({
          type: 'Six Clash (六沖)',
          positions: `${branchNames[i]}-${branchNames[j]}`,
          branches: `${b1}-${b2}`,
          branchesEn: `${EARTHLY_BRANCHES[b1]?.animal || b1} vs ${EARTHLY_BRANCHES[b2]?.animal || b2}`,
          description: `The ${EARTHLY_BRANCHES[b1]?.animal || b1} and ${EARTHLY_BRANCHES[b2]?.animal || b2} branches clash — creating tension between the ${branchNames[i]} and ${branchNames[j]} areas of your chart.`,
        });
      }

      // Check Six Combinations (六合)
      const pairKey1 = b1 + b2;
      const pairKey2 = b2 + b1;
      const combo = BRANCH_SIX_COMBINATIONS[pairKey1] || BRANCH_SIX_COMBINATIONS[pairKey2];
      if (combo) {
        interactions.push({
          type: 'Six Combination (六合)',
          positions: `${branchNames[i]}-${branchNames[j]}`,
          branches: `${b1}-${b2}`,
          branchesEn: `${EARTHLY_BRANCHES[b1]?.animal || b1} + ${EARTHLY_BRANCHES[b2]?.animal || b2}`,
          description: `The ${EARTHLY_BRANCHES[b1]?.animal || b1} and ${EARTHLY_BRANCHES[b2]?.animal || b2} form a ${combo} combination — strengthening the ${branchNames[i]} and ${branchNames[j]} areas synergistically.`,
        });
      }
    }
  }

  // Check Triple Combinations (三合) - check if 3 of the 4 branches form a triple
  const presentBranches = [branches.year, branches.month, branches.day, branches.hour].filter(Boolean);
  for (const [triple, info] of Object.entries(BRANCH_TRIPLE_COMBINATIONS)) {
    const needed = triple.match(/.{1}/g) || [];
    const matched = needed.filter(n => presentBranches.includes(n));
    if (matched.length === 3) {
      interactions.push({
        type: 'Triple Combination (三合)',
        branches: needed.join(''),
        branchesEn: info.animals.join(' + '),
        elementCreated: info.element,
        description: `The ${info.animals.join(', ')} form a powerful Triple Combination, generating strong ${info.element} energy that transforms your chart.`,
      });
    }
  }

  // Check Punishments (刑)
  for (let i = 0; i < branchNames.length; i++) {
    for (let j = i + 1; j < branchNames.length; j++) {
      const b1 = branches[branchNames[i]];
      const b2 = branches[branchNames[j]];
      if (!b1 || !b2) continue;

      const isPunishment = BRANCH_THREE_PUNISHMENTS.some(pair => 
        pair.length === 2 && ((pair[0] === b1 && pair[1] === b2) || (pair[0] === b2 && pair[1] === b1))
      );
      if (isPunishment) {
        interactions.push({
          type: 'Punishment (相刑)',
          positions: `${branchNames[i]}-${branchNames[j]}`,
          branches: `${b1}-${b2}`,
          branchesEn: `${EARTHLY_BRANCHES[b1]?.animal || b1} x ${EARTHLY_BRANCHES[b2]?.animal || b2}`,
          description: `The ${EARTHLY_BRANCHES[b1]?.animal || b1} and ${EARTHLY_BRANCHES[b2]?.animal || b2} create a punishment relationship — a subtle tension requiring conscious awareness.`,
        });
      }
    }
  }

  // Check Self-Punishment (自刑)
  for (let i = 0; i < branchNames.length; i++) {
    for (let j = i + 1; j < branchNames.length; j++) {
      if (branches[branchNames[i]] === branches[branchNames[j]] && 
          BRANCH_SELF_PUNISHMENTS.includes(branches[branchNames[i]])) {
        interactions.push({
          type: 'Self-Punishment (自刑)',
          positions: `${branchNames[i]}-${branchNames[j]}`,
          branches: `${branches[branchNames[i]]}`,
          branchesEn: `Two ${EARTHLY_BRANCHES[branches[branchNames[i]]]?.animal || branches[branchNames[i]]}`,
          description: `Two ${EARTHLY_BRANCHES[branches[branchNames[i]]]?.animal || branches[branchNames[i]]} branches appear, creating a self-punishment energy that amplifies introspection.`,
        });
      }
    }
  }

  return interactions;
}

/**
 * Generate annual forecast for specific years
 * @param {string} yearStemBranch - e.g. '丙午' for 2026
 * @param {object} pillars - Four pillars
 * @param {object} dayMasterInfo - Day master info
 * @param {object} luckPillar - Current luck pillar (optional)
 */
function generateAnnualForecast(year, yearStem, yearBranch, dayMasterStem, pillars, currentLuckPillar, elementPercentages) {
  const dmElement = STEM_TO_ELEMENT[dayMasterStem];
  const yearElement = STEM_TO_ELEMENT[yearStem];

  // Check interactions between annual branch and branch pillars
  const branchInteractions = [];
  for (const [pos, pillar] of Object.entries(pillars)) {
    if (!pillar?.branch) continue;
    // Clash
    const isClash = BRANCH_SIX_CLASHES.some(pair => 
      (pair[0] === yearBranch && pair[1] === pillar.branch) || 
      (pair[0] === pillar.branch && pair[1] === yearBranch)
    );
    if (isClash) {
      branchInteractions.push(`${pos.toUpperCase()} Pillar clashes with the year's energy`);
    }
    // Combination
    const k1 = yearBranch + pillar.branch;
    const k2 = pillar.branch + yearBranch;
    if (BRANCH_SIX_COMBINATIONS[k1] || BRANCH_SIX_COMBINATIONS[k2]) {
      branchInteractions.push(`${pos.toUpperCase()} Pillar combines favorably with the year's energy`);
    }
  }

  // Element relationship with year
  let yearRelationship = '';
  if (GENERATING_CYCLE[dmElement] === yearElement) {
    yearRelationship = 'The year\'s energy supports your expression and creativity';
  } else if (GENERATING_CYCLE[yearElement] === dmElement) {
    yearRelationship = 'The year nourishes your core energy — a supportive period';
  } else if (CONTROLLING_CYCLE[dmElement] === yearElement) {
    yearRelationship = 'Your energy naturally governs the year\'s challenges — you are in control';
  } else if (CONTROLLING_CYCLE[yearElement] === dmElement) {
    yearRelationship = 'The year\'s energy tests your foundations — growth through challenge';
  } else if (yearElement === dmElement) {
    yearRelationship = 'The year amplifies your element — a powerful time of alignment';
  }

  return {
    year,
    stem: yearStem,
    stemEn: HEAVENLY_STEMS[yearStem]?.en || yearStem,
    branch: yearBranch,
    branchEn: EARTHLY_BRANCHES[yearBranch]?.en || yearBranch,
    animal: EARTHLY_BRANCHES[yearBranch]?.animal || '',
    stemElement: yearElement,
    branchElement: STEM_TO_ELEMENT[BRANCH_HIDDEN_STEMS[yearBranch]?.[0]] || 'Unknown',
    relationship: yearRelationship,
    branchInteractions,
  };
}

/**
 * Determine current luck pillar based on age
 */
function getCurrentLuckPillar(daYunData, age) {
  if (!daYunData || !daYunData.pillars) return null;
  for (const pillar of daYunData.pillars) {
    const [start, end] = pillar.ageRange.split('-').map(Number);
    if (age >= start && age <= end) return pillar;
  }
  return null;
}

/**
 * Main function: calculate all advanced data
 */
function calculateAdvancedBaziData(baziResult, gender, birthDate, birthTime, longitude, timezoneOffset) {
  if (!baziResult || !baziResult.pillars) {
    return null;
  }

  const pillars = baziResult.pillars;
  const dayMasterStem = pillars.day?.stem;
  const monthStem = pillars.month?.stem;
  const monthBranch = pillars.month?.branch;

  // 1. Full Hidden Stems
  const hiddenStemsData = calculateAllHiddenStems(pillars);

  // 2. Ten Deities
  const tenDeities = calculateTenDeities(dayMasterStem, pillars);

  // 3. Full Element Counts (with hidden stems)
  const fullElements = calculateFullElementCounts(pillars, hiddenStemsData);

  // 4. Da Yun (Luck Pillars)
  const daYun = calculateDaYun(gender, dayMasterStem, monthStem, monthBranch, birthDate, birthTime, longitude, timezoneOffset);

  // 5. Branch Interactions
  const branchInteractions = calculateBranchInteractions(pillars);

  // 6. Annual Forecasts (2025-2030)
  const annualForecasts = [];
  const yearlyStems = ['甲', '乙', '丙', '丁', '戊', '己'];
  const yearlyBranches = ['辰', '巳', '午', '未', '申', '酉'];
  for (let i = 0; i < 6; i++) {
    const year = 2025 + i;
    const stem = yearlyStems[i];
    const branch = yearlyBranches[i];
    annualForecasts.push(generateAnnualForecast(
      year, stem, branch, dayMasterStem, pillars, 
      daYun?.pillars?.[0], fullElements.percentages
    ));
  }

  return {
    hiddenStems: hiddenStemsData,
    tenDeities,
    fullElementCounts: fullElements,
    daYun,
    branchInteractions,
    annualForecasts,
    accuracy: baziResult.accuracyNote,
  };
}

/**
 * Generate a summary of the Day Master's ten deities for the preview
 */
function getTenDeitiesSummary(tenDeities, dayMasterEn) {
  if (!tenDeities) return '';
  const deities = Object.values(tenDeities).filter(d => d.tenGodEn !== 'The Self (Day Master)');
  const names = deities.map(d => `${d.tenGodEn} (${d.stemEn})`);
  return `Your chart's supporting energies: ${names.join(', ')}`;
}

module.exports = {
  getFullHiddenStems,
  calculateTenDeities,
  calculateFullElementCounts,
  calculateAllHiddenStems,
  calculateDaYun,
  calculateBranchInteractions,
  generateAnnualForecast,
  getCurrentLuckPillar,
  calculateAdvancedBaziData,
  getTenDeitiesSummary,
  STEM_TO_ELEMENT,
  BRANCH_MAIN_ELEMENT,
};
