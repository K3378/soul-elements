/**
 * Soul Elements — Element Scoring & Balance Calculator
 * 
 * Calculates weighted five-element scores including hidden stems,
 * generating/nourishing/controlling cycle analysis, and balance assessment.
 */

/**
 * Element mapping for Heavenly Stems
 */
const STEM_TO_ELEMENT = {
  '甲': 'Wood', '乙': 'Wood',
  '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

/**
 * Element mapping for Earthly Branches (main energy)
 */
const BRANCH_MAIN_ELEMENT = {
  '子': 'Water', '丑': 'Earth', '寅': 'Wood', '卯': 'Wood',
  '辰': 'Earth', '巳': 'Fire', '午': 'Fire', '未': 'Earth',
  '申': 'Metal', '酉': 'Metal', '戌': 'Earth', '亥': 'Water',
};

/**
 * Hidden stems for each earthly branch (full list)
 * Order: [main (本氣), secondary (中氣), residual (餘氣)]
 */
const BRANCH_HIDDEN_STEMS = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

/**
 * Generating Cycle (相生): Wood → Fire → Earth → Metal → Water → Wood
 */
const GENERATING_CYCLE = {
  'Wood': 'Fire',
  'Fire': 'Earth',
  'Earth': 'Metal',
  'Metal': 'Water',
  'Water': 'Wood',
};

/**
 * Controlling Cycle (相剋): Wood → Earth → Water → Fire → Metal → Wood
 */
const CONTROLLING_CYCLE = {
  'Wood': 'Earth',
  'Earth': 'Water',
  'Water': 'Fire',
  'Fire': 'Metal',
  'Metal': 'Wood',
};

/**
 * Get full hidden stems for a branch with English translations
 */
function getFullHiddenStems(branch) {
  const stems = BRANCH_HIDDEN_STEMS[branch] || [];
  return stems.map((stem, i) => ({
    stem,
    element: STEM_TO_ELEMENT[stem] || 'Unknown',
    depth: i === 0 ? 'main' : i === 1 ? 'secondary' : 'residual',
  }));
}

/**
 * Calculate weighted five-element scores
 * 
 * Weights:
 * - Heavenly Stem: ×4
 * - Branch main hidden stem (本氣): ×3
 * - Branch secondary hidden stem (中氣): ×2
 * - Branch residual hidden stem (餘氣): ×1
 * 
 * @param {Object} pillars - Four pillars with stem/branch
 * @returns {Object} Element counts, weights, and percentages
 */
function calculateElementScores(pillars) {
  const counts = { 'Wood': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };
  const weights = { 'Wood': 0, 'Fire': 0, 'Earth': 0, 'Metal': 0, 'Water': 0 };

  // Count stems (weight ×4)
  for (const [position, pillar] of Object.entries(pillars)) {
    if (pillar && pillar.stem) {
      const elem = STEM_TO_ELEMENT[pillar.stem];
      if (elem) {
        counts[elem]++;
        weights[elem] += 4;
      }
    }
  }

  // Count hidden stems from branches
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

  // Determine dominant and deficient elements
  const sorted = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a);
  const dominant = sorted[0]?.[0] || 'Wood';
  const deficient = sorted[sorted.length - 1]?.[0] || 'Water';

  return {
    counts,
    weights,
    percentages,
    dominant,
    deficient,
    totalWeight,
    sortedElements: sorted,
  };
}

/**
 * Assess element balance
 * Returns a balance assessment with recommendations
 * 
 * @param {Object} elementData - Output from calculateElementScores
 * @param {string} dayMasterElement - Element of the Day Master
 * @returns {Object} Balance assessment
 */
function assessBalance(elementData, dayMasterElement) {
  const { percentages, sortedElements } = elementData;

  // Calculate balance score (0-100, higher = more balanced)
  const ideal = 20; // Perfect balance = 20% each
  let deviation = 0;
  for (const pct of Object.values(percentages)) {
    deviation += Math.abs(pct - ideal);
  }
  const balanceScore = Math.max(0, Math.round(100 - deviation * 2));

  // Find what generates and controls the day master
  const generating = Object.entries(GENERATING_CYCLE)
    .find(([, v]) => v === dayMasterElement)?.[0] || 'Earth';
  const controlled = CONTROLLING_CYCLE[dayMasterElement] || 'Water';
  const controls = Object.entries(CONTROLLING_CYCLE)
    .find(([, v]) => v === dayMasterElement)?.[0] || 'Fire';

  // Generate recommendations
  const recommendations = [];
  const weakElements = sortedElements
    .filter(([, pct]) => pct < 15)
    .map(([elem]) => elem);

  if (weakElements.length > 0) {
    const weakest = weakElements[0];
    const nourishingElement = Object.entries(GENERATING_CYCLE)
      .find(([, v]) => v === weakest)?.[0];
    recommendations.push({
      element: weakest,
      issue: 'deficient',
      advice: `Strengthen ${weakest} energy. Your chart lacks this element. ${nourishingElement ? `Nourish it with ${nourishingElement}.` : ''}`,
    });
  }

  const strongElements = sortedElements
    .filter(([, pct]) => pct > 30)
    .map(([elem]) => elem);

  if (strongElements.length > 0) {
    const strongest = strongElements[0];
    const controlling = CONTROLLING_CYCLE[strongest];
    recommendations.push({
      element: strongest,
      issue: 'excessive',
      advice: `Your ${strongest} energy is excessive. Balance it with ${controlling || 'complementary elements'}.`,
    });
  }

  return {
    dayMasterElement,
    balanceScore,
    generating,
    controlled,
    controls,
    recommendations,
    isBalanced: deviation < 30,
    deviationLevel: deviation < 20 ? 'Harmonious' : deviation < 35 ? 'Slightly Imbalanced' : 'Significantly Imbalanced',
  };
}

module.exports = {
  STEM_TO_ELEMENT,
  BRANCH_MAIN_ELEMENT,
  BRANCH_HIDDEN_STEMS,
  GENERATING_CYCLE,
  CONTROLLING_CYCLE,
  getFullHiddenStems,
  calculateElementScores,
  assessBalance,
};
