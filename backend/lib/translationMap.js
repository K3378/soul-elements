/**
 * Soul Elements — English BaZi Translation Map
 * 
 * Translates traditional Chinese BaZi terms into premium 
 * Western spiritual/psychological language for $49-$99 market.
 */

// =========== 十天干 (Heavenly Stems) ===========
const HEAVENLY_STEMS = {
  '甲': { en: 'Jia', element: 'Yang Wood', archetype: 'The Towering Pine', keywords: 'Growth, Integrity, Leadership' },
  '乙': { en: 'Yi', element: 'Yin Wood', archetype: 'The Climbing Vine', keywords: 'Flexibility, Creativity, Resilience' },
  '丙': { en: 'Bing', element: 'Yang Fire', archetype: 'The Radiant Sun', keywords: 'Passion, Visibility, Generosity' },
  '丁': { en: 'Ding', element: 'Yin Fire', archetype: 'The Candle Light', keywords: 'Inspiration, Insight, Warmth' },
  '戊': { en: 'Wu', element: 'Yang Earth', archetype: 'The Solid Mountain', keywords: 'Stability, Trust, Protection' },
  '己': { en: 'Ji', element: 'Yin Earth', archetype: 'The Fertile Garden', keywords: 'Nurturing, Productive, Resourceful' },
  '庚': { en: 'Geng', element: 'Yang Metal', archetype: 'The Sharpened Sword', keywords: 'Decisive, Loyal, Strong-willed' },
  '辛': { en: 'Xin', element: 'Yin Metal', archetype: 'The Elegant Jewelry', keywords: 'Refined, Precise, Unique' },
  '壬': { en: 'Ren', element: 'Yang Water', archetype: 'The Vast Ocean', keywords: 'Dynamic, Adventurous, Intelligence' },
  '癸': { en: 'Gui', element: 'Yin Water', archetype: 'The Gentle Rain', keywords: 'Intuitive, Wise, Spiritual' },
};

// =========== 十二地支 (Earthly Branches) ===========
const EARTHLY_BRANCHES = {
  '子': { en: 'Zi', animal: 'Rat', element: 'Yang Water' },
  '丑': { en: 'Chou', animal: 'Ox', element: 'Yin Earth' },
  '寅': { en: 'Yin', animal: 'Tiger', element: 'Yang Wood' },
  '卯': { en: 'Mao', animal: 'Rabbit', element: 'Yin Wood' },
  '辰': { en: 'Chen', animal: 'Dragon', element: 'Yang Earth' },
  '巳': { en: 'Si', animal: 'Snake', element: 'Yin Fire' },
  '午': { en: 'Wu', animal: 'Horse', element: 'Yang Fire' },
  '未': { en: 'Wei', animal: 'Goat', element: 'Yin Earth' },
  '申': { en: 'Shen', animal: 'Monkey', element: 'Yang Metal' },
  '酉': { en: 'You', animal: 'Rooster', element: 'Yin Metal' },
  '戌': { en: 'Xu', animal: 'Dog', element: 'Yang Earth' },
  '亥': { en: 'Hai', animal: 'Pig', element: 'Yin Water' },
};

// =========== 十神 (Ten Gods / Archetypes) ===========
const TEN_GODS = {
  '正印': { en: 'The Guardian', subtitle: 'The Sage', psychology: 'Support, Wisdom, Education' },
  '偏印': { en: 'The Mystic', subtitle: 'The Intuitive', psychology: 'Unconventional Wisdom, Solitude' },
  '比肩': { en: 'The Peer', subtitle: 'The Equal', psychology: 'Self-confidence, Independence' },
  '劫财': { en: 'The Competitor', subtitle: 'The Socialite', psychology: 'Charisma, Wealth Redistribution' },
  '食神': { en: 'The Creator', subtitle: 'The Gourmet', psychology: 'Expression, Enjoyment, Talent' },
  '傷官': { en: 'The Rebel Genius', subtitle: 'The Performer', psychology: 'Innovation, Breaking Rules, Art' },
  '正財': { en: 'The Steward', subtitle: 'The Earner', psychology: 'Stability, Diligence, Hard-earned Wealth' },
  '偏財': { en: 'The Entrepreneur', subtitle: 'The Investor', psychology: 'Venture Wealth, Opportunity, Luck' },
  '正官': { en: 'The Authority', subtitle: 'The Executive', psychology: 'Discipline, Status, Responsibility' },
  '七殺': { en: 'The Warrior', subtitle: 'The Challenger', psychology: 'Courage, High Pressure, Ambition' },
};

// =========== 五行 (Five Elements) ===========
const FIVE_ELEMENTS = {
  '木': { en: 'Wood', energy: 'Vitality & Expansion', color: '#4CAF50' },
  '火': { en: 'Fire', energy: 'Expression & Passion', color: '#FF5722' },
  '土': { en: 'Earth', energy: 'Grounding & Trust', color: '#CDA76D' },
  '金': { en: 'Metal', energy: 'Structure & Precision', color: '#CFC4B3' },
  '水': { en: 'Water', energy: 'Wisdom & Intuition', color: '#2196F3' },
};

// =========== 地支藏干 (Hidden Stems in Branches — FULL) ===========
// Format: [本氣 (main), 中氣 (secondary), 餘氣 (residual)]
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

// Stem element lookup
const STEM_TO_ELEMENT = {
  '甲': 'Wood', '乙': 'Wood', '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth', '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

// Branch main element (for quick reference)
const BRANCH_MAIN_ELEMENT = {
  '子': 'Water', '丑': 'Earth', '寅': 'Wood', '卯': 'Wood',
  '辰': 'Earth', '巳': 'Fire', '午': 'Fire', '未': 'Earth',
  '申': 'Metal', '酉': 'Metal', '戌': 'Earth', '亥': 'Water',
};

// =========== 十神 Calculation Rules ===========
// For each heavenly stem relative to Day Master
// Divided by Yin/Yang of the stem and the relationship
const TEN_GOD_RULES = {
  // Same element
  'sameYin': '比肩',   // Same element, same Yin/Yang -> Peer
  'sameYang': '劫财',   // Same element, opposite Yin/Yang -> Competitor
  // Generating (Day Master element -> stem element)
  'generatesSame': '食神',  // DM generates stem, same polarity -> Creator
  'generatesOpp': '傷官',  // DM generates stem, opposite polarity -> Rebel Genius
  // Controlled by (stem element -> DM element)
  'controlledSame': '正財',  // Stem controls DM, same polarity -> Steward
  'controlledOpp': '偏財',  // Stem controls DM, opposite polarity -> Entrepreneur
  // Controlling (DM element -> stem element)
  'controlsSame': '七殺',  // DM controls stem, same polarity -> Warrior
  'controlsOpp': '正官',   // DM controls stem, opposite polarity -> Authority
  // Nourishing (stem element -> DM element)
  'nourishesSame': '偏印',  // Stem nourishes DM, same polarity -> Mystic
  'nourishesOpp': '正印',   // Stem nourishes DM, opposite polarity -> Guardian
};

// =========== 地支 Relations ===========
const BRANCH_SIX_COMBINATIONS = {
  '子丑': '合土', '寅亥': '合木', '卯戌': '合火',
  '辰酉': '合金', '巳申': '合水', '午未': '合土',
};

const BRANCH_TRIPLE_COMBINATIONS = {
  '申子辰': { element: 'Water', animals: ['Monkey', 'Rat', 'Dragon'] },
  '亥卯未': { element: 'Wood', animals: ['Pig', 'Rabbit', 'Goat'] },
  '寅午戌': { element: 'Fire', animals: ['Tiger', 'Horse', 'Dog'] },
  '巳酉丑': { element: 'Metal', animals: ['Snake', 'Rooster', 'Ox'] },
};

const BRANCH_SIX_CLASHES = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

const BRANCH_THREE_PUNISHMENTS = [
  ['寅', '巳'],
  ['巳', '申'],
  ['丑', '未', '戌'],
];

const BRANCH_SELF_PUNISHMENTS = ['辰', '午', '酉', '亥'];

// Element generating cycle (生): Wood -> Fire -> Earth -> Metal -> Water -> Wood
const GENERATING_CYCLE = { 'Wood': 'Fire', 'Fire': 'Earth', 'Earth': 'Metal', 'Metal': 'Water', 'Water': 'Wood' };
// Element controlling cycle (克): Wood -> Earth -> Water -> Fire -> Metal -> Wood
const CONTROLLING_CYCLE = { 'Wood': 'Earth', 'Earth': 'Water', 'Water': 'Fire', 'Fire': 'Metal', 'Metal': 'Wood' };

module.exports = {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  TEN_GODS,
  FIVE_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
  STEM_TO_ELEMENT,
  BRANCH_MAIN_ELEMENT,
  TEN_GOD_RULES,
  BRANCH_SIX_COMBINATIONS,
  BRANCH_TRIPLE_COMBINATIONS,
  BRANCH_SIX_CLASHES,
  BRANCH_THREE_PUNISHMENTS,
  BRANCH_SELF_PUNISHMENTS,
  GENERATING_CYCLE,
  CONTROLLING_CYCLE,
};
