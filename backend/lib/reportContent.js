/**
 * Soul Elements — Report Content Generator
 * Generates full personalized report content from BaZi data.
 */

const ELEMENT_DESCRIPTIONS = {
  'Wood': {
    yang: {
      name: 'Yang Wood (Jia)',
      archetype: 'The Mighty Tree',
      traits: 'Ambitious, pioneering, and deeply principled. You are a natural leader who stands tall in the face of adversity, with an unshakable moral compass.',
      personality: 'You have the energy of the mighty tree — growing upward, reaching for the sky, providing shelter to those around you. Your presence demands respect, not through force, but through integrity and vision. You are driven by purpose and have an innate ability to inspire others to follow your lead.',
      strengths: 'Leadership, vision, integrity, resilience, generosity',
      weaknesses: 'Stubbornness, tendency to overextend, impatience with details',
      lifePathCareer: 'Your natural leadership makes you excel in roles where you can chart new territory. Entrepreneurship, management, real estate, and environmental fields align with your energy. You thrive when building something lasting.',
      lifePathLove: 'In relationships, you seek a partner who matches your ambition while providing a grounding presence. You need someone who respects your independence but also challenges your perspective.',
      lifePathInner: 'Your path is one of growth through contribution. The more you lift others, the higher you rise. Your purpose is found in creating lasting structures that benefit generations to come.',
    },
    yin: {
      name: 'Yin Wood (Yi)',
      archetype: 'The Delicate Flower',
      traits: 'Graceful, adaptable, and deeply perceptive. You move through the world with elegance, noticing what others overlook and flourishing in diverse environments.',
      personality: 'Like a delicate flower, you possess a quiet strength that bends but never breaks. Your adaptability is your superpower — you can thrive in any environment, finding beauty and opportunity where others see only hardship. Your sensitivity gives you deep insight into people and situations.',
      strengths: 'Adaptability, creativity, diplomacy, attention to detail, empathy',
      weaknesses: 'Indecisiveness, vulnerability to criticism, tendency to sacrifice own needs',
      lifePathCareer: 'Your creativity and attention to detail shine in design, therapy, writing, healing arts, and diplomatic roles. You excel in environments that require nuance and emotional intelligence.',
      lifePathLove: 'You need a partner who appreciates your sensitivity and provides a stable emotional foundation. Harmony and gentle communication are essential for your well-being in relationships.',
      lifePathInner: 'Your journey is about learning to stand firm while remaining flexible. True strength comes from knowing when to yield and when to stand your ground.',
    },
  },
  'Fire': {
    yang: {
      name: 'Yang Fire (Bing)',
      archetype: 'The Radiant Sun',
      traits: 'Charismatic, generous, and fiercely warm-hearted. Like the sun at midday, you illuminate everything around you and cannot help but draw others into your orbit.',
      personality: 'You are the sun — radiating warmth, energy, and vitality wherever you go. Your charisma is magnetic; people are naturally drawn to your enthusiasm and generosity. You have a big heart and an even bigger vision, always seeing the bright side of every situation and inspiring others to do the same.',
      strengths: 'Charisma, generosity, optimism, leadership, warmth',
      weaknesses: 'Overconfidence, impulsiveness, tendency to burn out, oversensitivity to rejection',
      lifePathCareer: 'Your natural radiance makes you perfect for public-facing roles. Entertainment, sales, teaching, motivational work, and any career that allows you to inspire others is your calling.',
      lifePathLove: 'You need a partner who can both bask in your light and offer their own. You are drawn to passionate, dynamic connections that make you feel truly alive.',
      lifePathInner: 'Your purpose is to shine — not to prove your worth, but to warm the world. Learn to rest between burnings, and your light will last a lifetime.',
    },
    yin: {
      name: 'Yin Fire (Ding)',
      archetype: 'The Gentle Flame',
      traits: 'Warm, refined, and deeply intuitive. Like a candle in the dark, you bring steady, focused light to those around you, illuminating truth with gentle persistence.',
      personality: 'You are the gentle flame — steady, warm, and illuminating. Unlike the blazing sun, you offer a focused, intimate warmth that makes people feel seen and understood. Your intuition is remarkably sharp, allowing you to perceive subtle truths that others miss. You bring refinement and grace to everything you touch.',
      strengths: 'Intuition, refinement, warmth, attention to detail, emotional depth',
      weaknesses: 'Tendency to worry, perfectionism, holding onto past hurts',
      lifePathCareer: 'Your refined energy excels in research, counseling, arts, spirituality, teaching, and any field requiring depth and precision. You make an excellent mentor or guide.',
      lifePathLove: 'You seek a deep, soulful connection. Surface-level relationships do not satisfy you. You need a partner who matches your emotional depth and intellectual curiosity.',
      lifePathInner: 'Your path is about learning to trust your inner light. You do not need to burn as brightly as others — your steady flame is more than enough to light your way.',
    },
  },
  'Earth': {
    yang: {
      name: 'Yang Earth (Wu)',
      archetype: 'The Steadfast Mountain',
      traits: 'Reliable, grounded, and unshakeable. Like a great mountain, you provide stability to all who come near you, standing firm through every season and storm.',
      personality: 'You are the mountain — solid, reliable, and enduring. Your presence brings a sense of safety and stability to those around you. You are not easily shaken, and your grounded nature makes you the person everyone turns to in times of crisis. You build your life on strong foundations, and everything you create is meant to last.',
      strengths: 'Reliability, patience, practicality, loyalty, generosity',
      weaknesses: 'Resistance to change, stubbornness, tendency to take on too much burden',
      lifePathCareer: 'Your steady nature excels in real estate, agriculture, construction, banking, management, and any field requiring long-term vision and reliability.',
      lifePathLove: 'You are a rock for your partner, offering unwavering support and stability. You need someone who appreciates your steadfast nature and brings warmth to your steady presence.',
      lifePathInner: 'Your lesson is that true strength includes flexibility. The mightiest mountains also allow rivers to flow through them. Learn when to stand firm and when to yield.',
    },
    yin: {
      name: 'Yin Earth (Ji)',
      archetype: 'The Nurturing Soil',
      traits: 'Nurturing, practical, and deeply thoughtful. Like rich soil, you enable growth in all around you, providing the foundation for dreams to take root.',
      personality: 'You are the nurturing soil — patient, receptive, and life-giving. Unlike the mountain\'s imposing presence, your support is quiet and essential. You have a gift for making things grow — whether plants, relationships, or business ventures. Your practical wisdom and attention to detail ensure that nothing under your care goes wanting.',
      strengths: 'Nurturing, practicality, reliability, thoughtfulness, adaptability',
      weaknesses: 'Self-neglect, worry, difficulty saying no, tendency to be taken for granted',
      lifePathCareer: 'Your nurturing energy flourishes in healthcare, education, counseling, hospitality, farming, and any role where you care for others\' growth and well-being.',
      lifePathLove: 'You give generously in relationships, sometimes too generously. You need a partner who sees and appreciates your quiet contributions and who nurtures you in return.',
      lifePathInner: 'Your path is to learn that you, too, deserve nurturing. The soil that gives endlessly must also be replenished. Self-care is not selfish — it is essential.',
    },
  },
  'Metal': {
    yang: {
      name: 'Yang Metal (Geng)',
      archetype: 'The Sharpened Sword',
      traits: 'Decisive, principled, and fiercely just. You cut through confusion with the precision of a blade, bringing clarity and structure to chaos.',
      personality: 'You are the sharpened sword — forged in fire, tempered by challenge, and honed to perfection. Your mind is sharp, your decisions are decisive, and your sense of justice is unwavering. You have no tolerance for dishonesty or mediocrity. Your strength lies in your ability to cut through complexity and reveal the essential truth.',
      strengths: 'Decisiveness, integrity, courage, precision, leadership',
      weaknesses: 'Rigidity, harshness, tendency to cut rather than nurture, impatience with weakness',
      lifePathCareer: 'Your decisive nature excels in law, military, surgery, engineering, technology, finance, and any field requiring precision and strong decision-making.',
      lifePathLove: 'You are fiercely loyal but can be demanding. You need a partner who matches your strength and is not intimidated by your intensity. Mutual respect is non-negotiable.',
      lifePathInner: 'Your journey is to learn that the greatest strength includes restraint. A true warrior knows when not to draw the sword. Justice without compassion becomes tyranny.',
    },
    yin: {
      name: 'Yin Metal (Xin)',
      archetype: 'The Elegant Jewelry',
      traits: 'Refined, precise, and uniquely beautiful. Like a mastercrafted piece of jewelry, your value is not in brute strength but in exquisite detail and rare beauty.',
      personality: 'You are the elegant jewelry — refined, precious, and detailed. Your strength is not in force but in fine craftsmanship and impeccable taste. You notice beauty where others see only function. Your standards are high, not out of arrogance, but because you truly appreciate excellence. You bring refinement to every endeavor and elevate those around you.',
      strengths: 'Refinement, precision, creativity, high standards, aesthetic sense',
      weaknesses: 'Perfectionism, sensitivity to criticism, tendency to feel undervalued, aloofness',
      lifePathCareer: 'Your refined nature excels in design, jewelry, fine arts, quality control, curation, luxury goods, and any field that rewards precision and aesthetic excellence.',
      lifePathLove: 'You seek a partner who appreciates your unique qualities and treats you with the care you deserve. You need depth, not flash — someone who sees the fine details of who you are.',
      lifePathInner: 'Your worth is inherent, not earned. You do not need to prove your value through perfection. Your unique beauty shines brightest when you allow yourself to be seen as you are.',
    },
  },
  'Water': {
    yang: {
      name: 'Yang Water (Ren)',
      archetype: 'The Surging River',
      traits: 'Flowing, strategic, and relentless. Like a great river, you find your way around every obstacle, gathering strength as you move toward your destiny.',
      personality: 'You are the surging river — powerful, fluid, and unstoppable. You cannot be contained; you find your way around, over, or through any obstacle. Your strategic mind sees the path ahead, and your adaptability allows you to navigate changing circumstances with grace. You gather strength from experience, growing more powerful as you flow through life.',
      strengths: 'Strategic thinking, adaptability, persistence, wisdom, communication',
      weaknesses: 'Restlessness, tendency to be manipulative, emotional overwhelm, impatience',
      lifePathCareer: 'Your flowing energy excels in strategy consulting, logistics, diplomacy, writing, technology, entrepreneurship, and any field requiring adaptability and big-picture thinking.',
      lifePathLove: 'You need a partner who can flow with you without trying to contain you. Someone who provides stable banks for your river — guiding without restricting.',
      lifePathInner: 'Your lesson is that power without direction is chaos. The greatest rivers are those channeled wisely. Learn to direct your immense energy with purpose and compassion.',
    },
    yin: {
      name: 'Yin Water (Gui)',
      archetype: 'The Still Lake',
      traits: 'Deep, intuitive, and profoundly wise. Like a still mountain lake, you reflect the world with perfect clarity while holding depths that few can fathom.',
      personality: 'You are the still lake — calm, deep, and reflective. On the surface, you appear serene, but beneath lies profound depth and wisdom. Your intuition is extraordinary; you see through appearances and understand hidden truths. You are a natural keeper of secrets and confidences. Your calm presence has a healing effect on those who spend time with you.',
      strengths: 'Intuition, wisdom, calmness, depth, patience, insight',
      weaknesses: 'Overthinking, tendency to withdraw, difficulty asserting yourself, melancholy',
      lifePathCareer: 'Your deep wisdom excels in counseling, psychology, research, spirituality, writing, therapy, and any field requiring insight and patience.',
      lifePathLove: 'You seek a partner who is willing to dive into your depths, not one who skims the surface. Trust is built slowly but once given, it is unshakeable.',
      lifePathInner: 'Your stillness is not emptiness — it is fullness. The stillest lake contains an entire universe beneath its surface. Your depth is your gift; share it wisely.',
    },
  },
};

const FIVE_ELEMENT_INSIGHTS = {
  Wood: {
    dominant: 'Wood energy dominates your chart, giving you exceptional growth potential and vision. You are a natural pioneer.',
    strong: 'Wood energy is strong in your chart, supporting your ability to grow, plan, and lead with vision.',
    weak: 'Wood energy is subtle in your chart. You may need to consciously cultivate patience and long-term vision.',
    missing: 'Wood energy is not present in your main pillars. Consider spending time in nature to balance this energy.',
  },
  Fire: {
    dominant: 'Fire energy dominates your chart, filling you with passion, charisma, and creative power.',
    strong: 'Fire energy flows strongly through you, enhancing your warmth and ability to inspire others.',
    weak: 'Fire energy is gentle in your chart. You may need to consciously express your passion and creativity.',
    missing: 'Fire energy is not present in your main pillars. Seek activities that ignite your inner spark.',
  },
  Earth: {
    dominant: 'Earth energy dominates your chart, making you incredibly grounded, reliable, and nurturing.',
    strong: 'Earth energy is strong in your chart, supporting your practical nature and ability to create stability.',
    weak: 'Earth energy is light in your chart. You may need to consciously practice grounding and patience.',
    missing: 'Earth energy is not present in your main pillars. Grounding practices like gardening or meditation would benefit you.',
  },
  Metal: {
    dominant: 'Metal energy dominates your chart, giving you exceptional clarity, precision, and strength of character.',
    strong: 'Metal energy runs strong through you, enhancing your decisiveness and ability to bring structure.',
    weak: 'Metal energy is subtle in your chart. You may need to cultivate discipline and clear boundaries.',
    missing: 'Metal energy is not present in your main pillars. Structure and routine may help you feel more centered.',
  },
  Water: {
    dominant: 'Water energy dominates your chart, endowing you with deep wisdom, intuition, and adaptability.',
    strong: 'Water energy flows strongly through you, enhancing your strategic thinking and emotional depth.',
    weak: 'Water energy is gentle in your chart. You may need to consciously trust your intuition more.',
    missing: 'Water energy is not present in your main pillars. Time near water can help balance your energy.',
  },
};

const GOAL_GUIDANCE = {
  career: {
    section: 'Career & Life Purpose',
    guidance: 'Your BaZi chart reveals your natural career gifts. Focus on work that aligns with your core element — this is where you will find both success and fulfillment. The energy of the coming years favors bold moves and strategic planning.',
    luckyDirections: 'North, West',
    luckyColors: 'Black, White, Gold',
    advice: 'Trust your Day Master energy when making career decisions. You are most effective when working in an environment that matches your elemental nature.',
  },
  love: {
    section: 'Love & Relationships',
    guidance: 'Your chart reveals deep insights into your relationship patterns. The elements present in your Pillars influence how you give and receive love. Understanding your elemental love language is key to harmonious relationships.',
    luckyDirections: 'East, Southeast',
    luckyColors: 'Red, Pink, Green',
    advice: 'The relationships that challenge you most are also the ones that help you grow. Look for a partner whose element complements rather than clashes with yours.',
  },
  peace: {
    section: 'Inner Peace & Spiritual Growth',
    guidance: 'Your chart points toward a deep need for inner harmony. The imbalance of elements in your birth chart is not a flaw — it is your unique spiritual curriculum. The elements that are weak in your chart represent your growth edges.',
    luckyDirections: 'Center, South',
    luckyColors: 'Yellow, Earth tones, White',
    advice: 'Meditation on your missing or weak elements can bring profound balance. Your spiritual path is uniquely yours — no two charts are the same.',
  },
  all: {
    section: 'Life Path & Opportunities',
    guidance: 'Your BaZi chart is a map of your life journey. Each pillar represents a different aspect of your existence, and the interplay of elements reveals where your greatest opportunities and challenges lie.',
    luckyDirections: 'Varies by season',
    luckyColors: 'Gold, Purple, Blue',
    advice: 'Live in alignment with your Day Master energy. When you honor your true nature, every aspect of your life comes into balance.',
  },
};

function getElementType(elementKey, isYang) {
  const upperKey = elementKey.charAt(0).toUpperCase() + elementKey.slice(1).toLowerCase();
  const elementData = ELEMENT_DESCRIPTIONS[upperKey];
  if (!elementData) return null;
  return isYang ? elementData.yang : elementData.yin;
}

function getDominantElement(percentages) {
  let max = 0;
  let dominant = null;
  for (const [elem, pct] of Object.entries(percentages)) {
    if (pct > max) { max = pct; dominant = elem; }
  }
  return { element: dominant, percentage: max };
}

function getElementInsight(elemKey, pct) {
  const insights = FIVE_ELEMENT_INSIGHTS[elemKey];
  if (!insights) return '';
  if (pct >= 38) return insights.dominant;
  if (pct >= 20) return insights.strong;
  if (pct > 0) return insights.weak;
  return insights.missing;
}

function generateFullReport(bazi, goal) {
  const dm = bazi.dayMaster;
  const percentages = bazi.fiveElements.percentages;
  const isYang = dm.element && dm.element.startsWith('Yang');
  const baseElement = dm.element ? dm.element.replace('Yang ', '').replace('Yin ', '') : 'Metal';
  const elementProfile = getElementType(baseElement, isYang);
  const dominant = getDominantElement(percentages);
  const goalData = GOAL_GUIDANCE[goal] || GOAL_GUIDANCE.all;
  const hiddenStems = bazi.hiddenStems || [];

  // Generate five elements analysis
  const elementAnalysis = {};
  for (const [elem, pct] of Object.entries(percentages)) {
    elementAnalysis[elem] = getElementInsight(elem, pct);
  }

  // Generate energy forecast based on day master
  const energyForecast = generateEnergyForecast(dm, percentages);

  // Generate life guidance
  const lifeGuidance = generateLifeGuidance(dm, dominant, goalData);

  return {
    personality: elementProfile ? {
      title: `${elementProfile.archetype} — ${elementProfile.traits}`,
      description: elementProfile.personality,
      strengths: elementProfile.strengths,
      weaknesses: elementProfile.weaknesses,
    } : {
      title: `${dm.archetype} — The Unique Self`,
      description: 'Your BaZi chart reveals a unique combination of energies that shape your personality and life path.',
      strengths: 'Self-awareness, adaptability',
      weaknesses: 'See full analysis for details',
    },
    elementAnalysis: {
      dominant: dominant.element,
      dominantPct: dominant.percentage,
      details: elementAnalysis,
    },
    fiveElementsInsight: generateFiveElementsBalance(percentages, dominant),
    lifeGuidance: {
      section: goalData.section,
      guidance: goalData.guidance,
      advice: goalData.advice,
      luckyDirections: goalData.luckyDirections,
      luckyColors: goalData.luckyColors,
    },
    hiddenStemsGuidance: hiddenStems.length > 0
      ? generateHiddenStemsGuidance(hiddenStems)
      : 'No hidden stems data available in this preview.',
    energyForecast: energyForecast,
    personalAffirmation: generateAffirmation(dm, baseElement),
  };
}

function generateEnergyForecast(dm, percentages) {
  const dominant = getDominantElement(percentages);
  const dmElement = dm.element || '';
  const baseElement = dmElement.replace('Yang ', '').replace('Yin ', '');

  const forecasts = {
    Wood: 'The coming years favor expansion and growth. Plant seeds now for what you wish to harvest in 3 years. Your energy is naturally rising — channel it into projects that have long-term potential.',
    Fire: 'This is a time of visibility and recognition. Your natural charisma is at its peak. Step into the spotlight and share your gifts with the world. Opportunities for leadership and creative expression abound.',
    Earth: 'Stability and consolidation are the themes ahead. Focus on strengthening your foundations — in relationships, finances, and health. This is a season for building, not venturing into new territory.',
    Metal: 'A period of refinement and cutting away what no longer serves you. Make decisive choices. Clear the clutter from your life — relationships, habits, and possessions that do not align with your highest self.',
    Water: 'Deep wisdom is available to you now. Spend time in reflection and study. Your intuition is heightened — trust the subtle messages you receive. Strategic planning done now will pay dividends.',
  };

  const userForecast = forecasts[baseElement] || 'The cosmic energies are shifting in your favor. Stay attuned to your intuition and embrace the changes coming your way.';

  return {
    summary: userForecast,
    detailed: `Based on your ${dmElement} Day Master and the dominance of ${dominant.element} (${dominant.percentage}%) in your chart, your energy forecast for the coming year emphasizes ${dominant.element.toLowerCase()} qualities. ${userForecast}`,
  };
}

function generateFiveElementsBalance(percentages, dominant) {
  const entries = Object.entries(percentages).sort((a, b) => b[1] - a[1]);

  let balanceDesc = '';
  if (entries.length <= 2) {
    balanceDesc = `Your chart is highly concentrated, with ${entries[0][0]} dominating.\n`;

  } else if (entries[0][1] >= 38) {
    balanceDesc = `${entries[0][0]} dominates your chart at ${entries[0][1]}%, giving you strong ${entries[0][0].toLowerCase()} characteristics.\n`;
  } else {
    const topTwo = entries.slice(0, 2);
    balanceDesc = `Your chart has a balanced distribution, with ${topTwo[0][0]} (${topTwo[0][1]}%) and ${topTwo[1][0]} (${topTwo[1][1]}%) leading.\n`;
  }

  // Check for missing/weak elements
  const weakElements = entries.filter(([, pct]) => pct <= 5);
  if (weakElements.length > 0) {
    balanceDesc += `Elements that are weak or missing (${weakElements.map(e => e[0]).join(', ')}) represent areas for conscious development and growth.\n`;
  }

  return balanceDesc;
}

function generateLifeGuidance(dm, dominant, goalData) {
  return `${goalData.guidance} Your ${dm.element} Day Master energy combines with ${dominant.element} dominance to create a unique life path. ${goalData.advice}`;
}

function generateAffirmation(dm, baseElement) {
  const affirmations = {
    Wood: 'I grow with purpose, reaching toward my highest potential while staying rooted in my values.',
    Fire: 'I shine my light freely, knowing my warmth serves the world exactly as it is meant to.',
    Earth: 'I am grounded and receptive, creating stability that nurtures all life around me.',
    Metal: 'I honor my truth with clarity and courage, cutting away what no longer serves my highest good.',
    Water: 'I flow with wisdom and grace, trusting the journey even when I cannot see the destination.',
  };
  return affirmations[baseElement] || 'I embrace my unique cosmic blueprint and trust the journey of my destiny.';
}

function generateHiddenStemsGuidance(hiddenStems) {
  let guidance = 'Your chart contains hidden influences that add depth to your character:\n';
  hiddenStems.forEach(hs => {
    guidance += `\n${hs.branch} branch contains: ${hs.stems.join(', ')}. These hidden energies influence your ${hs.branch === 'year' ? 'family and early life' : hs.branch === 'month' ? 'career and social life' : hs.branch === 'day' ? 'self and relationships' : 'creative pursuits and children'}.\n`;
  });
  return guidance;
}

module.exports = {
  generateFullReport,
};
