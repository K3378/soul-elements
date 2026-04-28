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

// =========== 地支藏干 (Hidden Stems in Branches — Basic) ===========
// Using main energy only (本氣) for Phase 1
const BRANCH_HIDDEN_STEMS = {
  '子': ['癸'],
  '丑': ['己'],
  '寅': ['甲'],
  '卯': ['乙'],
  '辰': ['戊'],
  '巳': ['丙'],
  '午': ['丁'],
  '未': ['己'],
  '申': ['庚'],
  '酉': ['辛'],
  '戌': ['戊'],
  '亥': ['壬'],
};

module.exports = {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  TEN_GODS,
  FIVE_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
};
