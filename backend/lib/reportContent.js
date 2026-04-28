/**
 * Soul Elements — Report Content Generator
 * 
 * Generates tiered report content:
 * - Free: 2 lines per section (for preview)
 * - Standard ($49): 10+ pages
 * - Grand Master ($99): 20+ pages
 */

const {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  BRANCH_MAIN_ELEMENT,
  TEN_GODS,
  GENERATING_CYCLE,
  CONTROLLING_CYCLE,
} = require('./translationMap');

const ELEMENT_DESCRIPTIONS = {
  'Wood': {
    yang: {
      name: 'Yang Wood (Jia) — The Towering Pine',
      archetype: 'The Towering Pine',
      traits: 'Ambitious, pioneering, and deeply principled. You are a natural leader who stands tall in the face of adversity, with an unshakable moral compass.',
      personality: 'You have the energy of the mighty tree — growing upward, reaching for the sky, providing shelter to those around you. Your presence demands respect, not through force, but through integrity and vision. You are driven by purpose and have an innate ability to inspire others to follow your lead.',
      strengths: 'Leadership, vision, integrity, resilience, generosity',
      weaknesses: 'Stubbornness, tendency to overextend, impatience with details',
      career: 'Your natural leadership makes you excel in roles where you can chart new territory. Entrepreneurship, management, real estate, and environmental fields align with your energy. You thrive when building something lasting.',
      love: 'In relationships, you seek a partner who matches your ambition while providing a grounding presence. You need someone who respects your independence but also challenges your perspective.',
      innerPath: 'Your path is one of growth through contribution. The more you lift others, the higher you rise. Your purpose is found in creating lasting structures that benefit generations to come.',
      communication: 'Direct and principled. You speak with conviction and expect others to do the same. You have little patience for vague or dishonest communication.',
      challenges: 'Your greatest challenge is learning to bend without breaking. Rigidity, while a source of strength, can also isolate you from valuable perspectives.',
    },
    yin: {
      name: 'Yin Wood (Yi) — The Climbing Vine',
      archetype: 'The Climbing Vine',
      traits: 'Graceful, adaptable, and deeply perceptive. You move through the world with elegance, noticing what others overlook and flourishing in diverse environments.',
      personality: 'Like a delicate flower, you possess a quiet strength that bends but never breaks. Your adaptability is your superpower — you can thrive in any environment, finding beauty and opportunity where others see only hardship. Your sensitivity gives you deep insight into people and situations.',
      strengths: 'Adaptability, creativity, diplomacy, attention to detail, empathy',
      weaknesses: 'Indecisiveness, vulnerability to criticism, tendency to sacrifice own needs',
      career: 'Your creativity and attention to detail shine in design, therapy, writing, healing arts, and diplomatic roles. You excel in environments that require nuance and emotional intelligence.',
      love: 'You need a partner who appreciates your sensitivity and provides a stable emotional foundation. Harmony and gentle communication are essential for your well-being in relationships.',
      innerPath: 'Your journey is about learning to stand firm while remaining flexible. True strength comes from knowing when to yield and when to stand your ground.',
      communication: 'Diplomatic and nuanced. You choose your words carefully and consider how they will be received. You excel at mediating conflicts.',
      challenges: 'Your greatest challenge is asserting your own needs. You are so attuned to others that you may lose sight of your own boundaries.',
    },
  },
  'Fire': {
    yang: {
      name: 'Yang Fire (Bing) — The Radiant Sun',
      archetype: 'The Radiant Sun',
      traits: 'Charismatic, generous, and fiercely warm-hearted. Like the sun at midday, you illuminate everything around you and cannot help but draw others into your orbit.',
      personality: 'You are the sun — radiating warmth, energy, and vitality wherever you go. Your charisma is magnetic; people are naturally drawn to your enthusiasm and generosity. You have a big heart and an even bigger vision, always seeing the bright side of every situation and inspiring others to do the same.',
      strengths: 'Charisma, generosity, optimism, leadership, warmth',
      weaknesses: 'Overconfidence, impulsiveness, tendency to burn out, oversensitivity to rejection',
      career: 'Your natural radiance makes you perfect for public-facing roles. Entertainment, sales, teaching, motivational work, and any career that allows you to inspire others is your calling.',
      love: 'You need a partner who can both bask in your light and offer their own. You are drawn to passionate, dynamic connections that make you feel truly alive.',
      innerPath: 'Your purpose is to shine — not to prove your worth, but to warm the world. Learn to rest between burnings, and your light will last a lifetime.',
      communication: 'Enthusiastic and expansive. You communicate with passion and animation, drawing others into your vision. You can sometimes overwhelm quieter communicators.',
      challenges: 'Your greatest challenge is managing your intensity. The same fire that fuels your charisma can also consume your energy. Learning to pace yourself is essential.',
    },
    yin: {
      name: 'Yin Fire (Ding) — The Candle Light',
      archetype: 'The Candle Light',
      traits: 'Warm, refined, and deeply intuitive. Like a candle in the dark, you bring steady, focused light to those around you, illuminating truth with gentle persistence.',
      personality: 'You are the gentle flame — steady, warm, and illuminating. Unlike the blazing sun, you offer a focused, intimate warmth that makes people feel seen and understood. Your intuition is remarkably sharp, allowing you to perceive subtle truths that others miss. You bring refinement and grace to everything you touch.',
      strengths: 'Intuition, refinement, warmth, attention to detail, emotional depth',
      weaknesses: 'Tendency to worry, perfectionism, holding onto past hurts',
      career: 'Your refined energy excels in research, counseling, arts, spirituality, teaching, and any field requiring depth and precision. You make an excellent mentor or guide.',
      love: 'You seek a deep, soulful connection. Surface-level relationships do not satisfy you. You need a partner who matches your emotional depth and intellectual curiosity.',
      innerPath: 'Your path is about learning to trust your inner light. You do not need to burn as brightly as others — your steady flame is more than enough to light your way.',
      communication: 'Warm and deliberate. You listen more than you speak, and when you do speak, your words carry weight. People feel heard and understood in your presence.',
      challenges: 'Your greatest challenge is releasing perfectionism. Your high standards can become a prison if you do not learn to embrace imperfection as part of beauty.',
    },
  },
  'Earth': {
    yang: {
      name: 'Yang Earth (Wu) — The Solid Mountain',
      archetype: 'The Solid Mountain',
      traits: 'Reliable, grounded, and unshakeable. Like a great mountain, you provide stability to all who come near you, standing firm through every season and storm.',
      personality: 'You are the mountain — solid, reliable, and enduring. Your presence brings a sense of safety and stability to those around you. You are not easily shaken, and your grounded nature makes you the person everyone turns to in times of crisis. You build your life on strong foundations, and everything you create is meant to last.',
      strengths: 'Reliability, patience, practicality, loyalty, generosity',
      weaknesses: 'Resistance to change, stubbornness, tendency to take on too much burden',
      career: 'Your steady nature excels in real estate, agriculture, construction, banking, management, and any field requiring long-term vision and reliability.',
      love: 'You are a rock for your partner, offering unwavering support and stability. You need someone who appreciates your steadfast nature and brings warmth to your steady presence.',
      innerPath: 'Your lesson is that true strength includes flexibility. The mightiest mountains also allow rivers to flow through them. Learn when to stand firm and when to yield.',
      communication: 'Straightforward and dependable. You say what you mean and mean what you say. You value substance over style and prefer clear, direct communication.',
      challenges: 'Your greatest challenge is embracing change. Your stability, while a gift, can also keep you in situations that no longer serve your growth.',
    },
    yin: {
      name: 'Yin Earth (Ji) — The Fertile Garden',
      archetype: 'The Fertile Garden',
      traits: 'Nurturing, practical, and deeply thoughtful. Like rich soil, you enable growth in all around you, providing the foundation for dreams to take root.',
      personality: 'You are the nurturing soil — patient, receptive, and life-giving. Unlike the mountain\'s imposing presence, your support is quiet and essential. You have a gift for making things grow — whether plants, relationships, or business ventures. Your practical wisdom and attention to detail ensure that nothing under your care goes wanting.',
      strengths: 'Nurturing, practicality, reliability, thoughtfulness, adaptability',
      weaknesses: 'Self-neglect, worry, difficulty saying no, tendency to be taken for granted',
      career: 'Your nurturing energy flourishes in healthcare, education, counseling, hospitality, farming, and any role where you care for others\' growth and well-being.',
      love: 'You give generously in relationships, sometimes too generously. You need a partner who sees and appreciates your quiet contributions and who nurtures you in return.',
      innerPath: 'Your path is to learn that you, too, deserve nurturing. The soil that gives endlessly must also be replenished. Self-care is not selfish — it is essential.',
      communication: 'Gentle and supportive. You have a gift for making others feel comfortable and valued. You are an excellent listener and a trusted confidant.',
      challenges: 'Your greatest challenge is setting boundaries. Your generosity can be exploited if you do not learn to protect your own energy.',
    },
  },
  'Metal': {
    yang: {
      name: 'Yang Metal (Geng) — The Sharpened Sword',
      archetype: 'The Sharpened Sword',
      traits: 'Decisive, principled, and fiercely just. You cut through confusion with the precision of a blade, bringing clarity and structure to chaos.',
      personality: 'You are the sharpened sword — forged in fire, tempered by challenge, and honed to perfection. Your mind is sharp, your decisions are decisive, and your sense of justice is unwavering. You have no tolerance for dishonesty or mediocrity. Your strength lies in your ability to cut through complexity and reveal the essential truth.',
      strengths: 'Decisiveness, integrity, courage, precision, leadership',
      weaknesses: 'Rigidity, harshness, tendency to cut rather than nurture, impatience with weakness',
      career: 'Your decisive nature excels in law, military, surgery, engineering, technology, finance, and any field requiring precision and strong decision-making.',
      love: 'You are fiercely loyal but can be demanding. You need a partner who matches your strength and is not intimidated by your intensity. Mutual respect is non-negotiable.',
      innerPath: 'Your journey is to learn that the greatest strength includes restraint. A true warrior knows when not to draw the sword. Justice without compassion becomes tyranny.',
      communication: 'Direct, precise, and commanding. You value truth over comfort and expect others to do the same. Your words carry the weight of conviction.',
      challenges: 'Your greatest challenge is cultivating patience and compassion. Your sharpness can wound if not tempered with empathy. The sword must also know how to sheathe itself.',
    },
    yin: {
      name: 'Yin Metal (Xin) — The Elegant Jewelry',
      archetype: 'The Elegant Jewelry',
      traits: 'Refined, precise, and uniquely beautiful. Like a mastercrafted piece of jewelry, your value is not in brute strength but in exquisite detail and rare beauty.',
      personality: 'You are the elegant jewelry — refined, precious, and detailed. Your strength is not in force but in fine craftsmanship and impeccable taste. You notice beauty where others see only function. Your standards are high, not out of arrogance, but because you truly appreciate excellence. You bring refinement to every endeavor and elevate those around you.',
      strengths: 'Refinement, precision, creativity, high standards, aesthetic sense',
      weaknesses: 'Perfectionism, sensitivity to criticism, tendency to feel undervalued, aloofness',
      career: 'Your refined nature excels in design, jewelry, fine arts, quality control, curation, luxury goods, and any field that rewards precision and aesthetic excellence.',
      love: 'You seek a partner who appreciates your unique qualities and treats you with the care you deserve. You need depth, not flash — someone who sees the fine details of who you are.',
      innerPath: 'Your worth is inherent, not earned. You do not need to prove your value through perfection. Your unique beauty shines brightest when you allow yourself to be seen as you are.',
      communication: 'Refined and articulate. You choose your words with care, appreciating nuance and subtlety. You have a gift for expressing complex ideas with elegance.',
      challenges: 'Your greatest challenge is overcoming the belief that your worth must be earned through perfection. You are valuable not despite your flaws, but including them.',
    },
  },
  'Water': {
    yang: {
      name: 'Yang Water (Ren) — The Vast Ocean',
      archetype: 'The Vast Ocean',
      traits: 'Flowing, strategic, and relentless. Like a great river, you find your way around every obstacle, gathering strength as you move toward your destiny.',
      personality: 'You are the surging river — powerful, fluid, and unstoppable. You cannot be contained; you find your way around, over, or through any obstacle. Your strategic mind sees the path ahead, and your adaptability allows you to navigate changing circumstances with grace. You gather strength from experience, growing more powerful as you flow through life.',
      strengths: 'Strategic thinking, adaptability, persistence, wisdom, communication',
      weaknesses: 'Restlessness, tendency to be manipulative, emotional overwhelm, impatience',
      career: 'Your flowing energy excels in strategy consulting, logistics, diplomacy, writing, technology, entrepreneurship, and any field requiring adaptability and big-picture thinking.',
      love: 'You need a partner who can flow with you without trying to contain you. Someone who provides stable banks for your river — guiding without restricting.',
      innerPath: 'Your lesson is that power without direction is chaos. The greatest rivers are those channeled wisely. Learn to direct your immense energy with purpose and compassion.',
      communication: 'Expansive and strategic. You see the big picture and communicate with vision. Your words can inspire and guide, but you may sometimes overwhelm with the breadth of your thinking.',
      challenges: 'Your greatest challenge is finding focus amidst your vast potential. Your adaptability can become a liability if you spread yourself too thin.',
    },
    yin: {
      name: 'Yin Water (Gui) — The Gentle Rain',
      archetype: 'The Gentle Rain',
      traits: 'Deep, intuitive, and profoundly wise. Like a still mountain lake, you reflect the world with perfect clarity while holding depths that few can fathom.',
      personality: 'You are the still lake — calm, deep, and reflective. On the surface, you appear serene, but beneath lies profound depth and wisdom. Your intuition is extraordinary; you see through appearances and understand hidden truths. You are a natural keeper of secrets and confidences. Your calm presence has a healing effect on those who spend time with you.',
      strengths: 'Intuition, wisdom, calmness, depth, patience, insight',
      weaknesses: 'Overthinking, tendency to withdraw, difficulty asserting yourself, melancholy',
      career: 'Your deep wisdom excels in counseling, psychology, research, spirituality, writing, therapy, and any field requiring insight and patience.',
      love: 'You seek a partner who is willing to dive into your depths, not one who skims the surface. Trust is built slowly but once given, it is unshakeable.',
      innerPath: 'Your stillness is not emptiness — it is fullness. The stillest lake contains an entire universe beneath its surface. Your depth is your gift; share it wisely.',
      communication: 'Quiet and profound. You speak sparingly but your words carry deep insight. You have a gift for saying exactly what someone needs to hear.',
      challenges: 'Your greatest challenge is stepping out of your depth and into action. Your reflective nature can lead to paralysis by analysis if you do not learn to act on your intuitions.',
    },
  },
};

const FIVE_ELEMENT_INSIGHTS = {
  Wood: {
    dominant: 'Wood energy dominates your chart at %. This gives you exceptional growth potential, vision, and pioneering spirit. You are a natural leader who thrives on expansion and innovation. Your challenge is to remain grounded as you reach for the sky. Focus on cultivating patience and attention to detail — qualities that will ensure your growth has a solid foundation.',
    strong: 'Wood energy is strong in your chart at %, supporting your ability to grow, plan, and lead with vision. You have a natural gift for seeing the big picture and inspiring others to join your journey. Your growth-oriented nature serves you well in most areas of life. Nurture this energy with regular time in natural settings.',
    weak: 'Wood energy is subtle in your chart at %. You may find it challenging to maintain long-term vision or trust the process of growth. Consciously cultivate patience and persistence. Spend time in forests or gardens to strengthen this energy. Surround yourself with people who embody growth and expansion.',
    missing: 'Wood energy is absent from your main chart structure. You may struggle with planning, vision, and forward momentum. Deliberately cultivate these qualities through mentorship, reading biographies of visionary leaders, and spending time in nature. Consider planting a tree or starting a garden as a symbolic practice.',
  },
  Fire: {
    dominant: 'Fire energy dominates your chart at %. You are filled with passion, charisma, and creative power. Your warmth draws people to you, and your enthusiasm is contagious. You have the gift of inspiring others simply by being yourself. Your challenge is to harness this energy sustainably — the brightest flames also risk burning out. Build practices that allow you to rest and recharge.',
    strong: 'Fire energy flows strongly through you at %, enhancing your warmth and ability to inspire others. You have a natural charisma that opens doors and creates opportunities. Your passion for life is one of your greatest assets. Channel this energy into creative projects that allow your light to shine.',
    weak: 'Fire energy is gentle in your chart at %. You may find it difficult to express passion or step into the spotlight. Consciously practice expressing your emotions and desires. Creative expression — whether through art, music, or writing — can help kindle your inner fire.',
    missing: 'Fire energy is absent from your main chart structure. Warmth, passion, and visibility may not come naturally to you. Seek activities that ignite your inner spark — dancing, performing, or simply spending time with passionate people. Your fire exists; it may just need the right conditions to catch.',
  },
  Earth: {
    dominant: 'Earth energy dominates your chart at %. This makes you incredibly grounded, reliable, and nurturing. You are the foundation upon which others build their lives. Your stability is your superpower — in a chaotic world, you are the calm center. Your challenge is to avoid becoming so grounded that you resist necessary change. Practice flexibility while maintaining your core strength.',
    strong: 'Earth energy is strong in your chart at %, supporting your practical nature and ability to create stability. You have a gift for making things last — relationships, projects, and resources all benefit from your steady hand. Your reliability is one of your most valued qualities.',
    weak: 'Earth energy is light in your chart at %. You may sometimes feel ungrounded or struggle with consistency. Consciously practice grounding: walking barefoot on earth, gardening, cooking, or any physical craft that connects you to the material world.',
    missing: 'Earth energy is not present in your main chart structure. Grounding and stability may not come naturally. Deliberately cultivate these qualities through routine, physical exercise, and connection to nature. The earth is always there to support you — you need only reach out.',
  },
  Metal: {
    dominant: 'Metal energy dominates your chart at %. You possess exceptional clarity, precision, and strength of character. Your ability to cut through complexity and identify essential truths is rare and valuable. You are a natural judge of quality — in people, ideas, and endeavors. Your challenge is to temper your sharpness with compassion. The finest blade is one that knows when to remain sheathed.',
    strong: 'Metal energy runs strong through you at %, enhancing your decisiveness and ability to bring structure to chaos. You have a natural gift for quality and discrimination. Your standards are high, and this serves you well in endeavors requiring precision and integrity.',
    weak: 'Metal energy is subtle in your chart at %. You may find it challenging to establish boundaries or make decisive cuts in your life. Consciously practice discernment and discipline. Decluttering your physical and emotional space can help strengthen this energy.',
    missing: 'Metal energy is absent from your main chart structure. Boundaries, structure, and discernment may not come naturally. Work on developing clear personal boundaries and practicing decisive action. The structure you create will liberate you.',
  },
  Water: {
    dominant: 'Water energy dominates your chart at %. You are endowed with deep wisdom, intuition, and adaptability. Like water, you find your way around every obstacle, flowing with grace and power. Your strategic mind and emotional depth make you a formidable presence. Your challenge is to channel your depth into action — the deepest waters risk becoming stagnant if they do not flow.',
    strong: 'Water energy flows strongly through you at %, enhancing your strategic thinking and emotional depth. You have a natural gift for understanding complex systems and navigating uncertainty. Your intuition is a reliable guide — trust it.',
    weak: 'Water energy is gentle in your chart at %. You may find it difficult to trust your intuition or go with the flow. Consciously practice surrendering to uncertainty. Meditation, time near water, and journaling can help deepen your connection to this energy.',
    missing: 'Water energy is not present in your main chart structure. Intuition and adaptability may not be your default modes. Spend time near water — oceans, lakes, rivers — to connect with this energy. Practice going with the flow in small ways daily.',
  },
};

const GOAL_GUIDANCE = {
  career: {
    section: 'Professional Path & Career Strategy',
    guidance: 'Your BaZi chart reveals the blueprint of your professional potential. The interplay of elements in your Four Pillars indicates not just what you are good at, but what will sustain your interest and energy over a lifetime. Your Day Master energy holds the key to your authentic professional expression.',
    luckyDirections: 'North, West',
    luckyColors: 'Black, White, Gold',
    advice: 'Trust your Day Master energy when making career decisions. You are most effective when working in an environment that matches your elemental nature. Avoid careers that force you to suppress your essential qualities — the resulting success will feel hollow.',
  },
  love: {
    section: 'Love, Relationships & Emotional Blueprint',
    guidance: 'Your chart reveals deep patterns in how you give, receive, and experience love. The Pillars that govern relationships in your BaZi show not just your ideal partner, but the emotional growth that your relationships are designed to facilitate.',
    luckyDirections: 'East, Southeast',
    luckyColors: 'Red, Pink, Green',
    advice: 'The relationships that challenge you most are also the ones that help you grow. Look for a partner whose element complements rather than clashes with yours. Your emotional patterns are written in the stars — but you have the power to rewrite them.',
  },
  peace: {
    section: 'Inner Harmony & Spiritual Evolution',
    guidance: 'Your BaZi chart reveals your path to inner peace. The elements that are strong in your chart represent your natural gifts; the weak elements represent your spiritual curriculum. Balance is not about making all elements equal — it is about integrating your strengths and growing your edges.',
    luckyDirections: 'Center, South',
    luckyColors: 'Yellow, Earth tones, White',
    advice: 'Meditation on your missing or weak elements can bring profound balance. Your spiritual path is uniquely yours — no two charts are the same. The imbalances in your chart are not flaws; they are invitations to grow.',
  },
  all: {
    section: 'Comprehensive Life Strategy',
    guidance: 'Your BaZi chart is a complete map of your life journey. Each Pillar governs a different domain, and the interplay of elements reveals where your greatest opportunities and challenges lie. This report integrates all major life areas into a unified strategic view.',
    luckyDirections: 'Varies by element and season',
    luckyColors: 'Gold, Purple, Blue',
    advice: 'Live in alignment with your Day Master energy. When you honor your true nature, every aspect of your life finds its natural balance. Your chart is not a prediction — it is a map. You are the navigator.',
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
  let text;
  if (pct >= 38) text = insights.dominant;
  else if (pct >= 20) text = insights.strong;
  else if (pct > 0) text = insights.weak;
  else text = insights.missing;
  return text.replace('%', `${pct}%`);
}

/**
 * Generate the complete report for Standard or Grand Master tier
 */
function generateFullReport(bazi, goal, tier = 'standard') {
  const dm = bazi.dayMaster;
  const percentages = bazi.fiveElements.percentages;
  const fullPercentages = bazi.fullElements?.percentages || percentages;
  const isYang = dm.element && dm.element.startsWith('Yang');
  const baseElement = dm.element ? dm.element.replace('Yang ', '').replace('Yin ', '') : 'Metal';
  const elementProfile = getElementType(baseElement, isYang);
  const dominant = getDominantElement(percentages);
  const goalData = GOAL_GUIDANCE[goal] || GOAL_GUIDANCE.all;
  const isGrandMaster = tier === 'grandmaster';

  // Five elements analysis
  const elementAnalysis = {};
  for (const [elem, pct] of Object.entries(percentages)) {
    elementAnalysis[elem] = getElementInsight(elem, pct);
  }

  // Hidden stems analysis
  const hiddenStemsData = bazi.hiddenStems || {};
  const hiddenGuidance = generateHiddenStemsGuidance(hiddenStemsData);

  // Ten Deities analysis
  const tenDeitiesData = bazi.tenDeities || {};
  const tenDeitiesAnalysis = generateTenDeitiesAnalysis(tenDeitiesData, dm);

  // Branch interactions analysis
  const branchInteractions = bazi.branchInteractions || [];
  const branchAnalysis = generateBranchInteractionAnalysis(branchInteractions);

  // Da Yun analysis
  const daYunData = bazi.daYun || {};
  const daYunAnalysis = generateDaYunAnalysis(daYunData, dm);

  // Annual forecasts
  const forecasts = bazi.annualForecasts || [];
  const annualForecast = generateAnnualForecastContent(forecasts);

  // Element balance
  const fiveElementsInsight = generateFiveElementsBalance(fullPercentages, dominant);

  // Energy forecast
  const energyForecast = generateEnergyForecast(dm, percentages, isGrandMaster);

  // Life guidance
  const lifeGuidance = generateLifeGuidance(dm, dominant, goalData);

  // Affirmation
  const affirmation = generateAffirmation(dm, baseElement);

  // Return just the content parts
  return {
    personality: elementProfile ? {
      title: `${elementProfile.archetype} — ${elementProfile.traits}`,
      description: elementProfile.personality,
      strengths: elementProfile.strengths,
      weaknesses: elementProfile.weaknesses,
      communication: elementProfile.communication || '',
      challenges: elementProfile.challenges || '',
    } : null,
    elementAnalysis: {
      dominant: dominant.element,
      dominantPct: dominant.percentage,
      details: elementAnalysis,
      fullElementDetails: isGrandMaster ? generateFullElementDetail(fullPercentages) : null,
    },
    fiveElementsInsight,
    lifeGuidance: {
      section: goalData.section,
      guidance: goalData.guidance,
      advice: goalData.advice,
      luckyDirections: goalData.luckyDirections,
      luckyColors: goalData.luckyColors,
      careerPath: elementProfile?.career || '',
      lovePath: elementProfile?.love || '',
      innerPath: elementProfile?.innerPath || '',
    },
    hiddenStemsGuidance: hiddenGuidance,
    tenDeities: tenDeitiesAnalysis,
    branchInteractions: branchAnalysis,
    daYun: daYunAnalysis,
    annualForecast,
    energyForecast: {
      summary: energyForecast.summary,
      detailed: energyForecast.detailed,
      yearlyBreakdown: isGrandMaster ? forecasts : null,
    },
    personalAffirmation: affirmation,
    tier: tier,
    pageCount: isGrandMaster ? '20+ pages — Grand Master Edition' : '10+ pages — Standard Edition',
  };
}

/**
 * Generate hidden stems guidance
 */
function generateHiddenStemsGuidance(hiddenStemsData) {
  const positions = ['year', 'month', 'day', 'hour'];
  const positionDescriptions = {
    year: 'Your Early Foundations & Family Heritage',
    month: 'Your Career & Social Expression',
    day: 'Your Core Self & Relationships',
    hour: 'Your Inner World & Later Years',
  };

  let parts = [];
  for (const [pos, hd] of Object.entries(hiddenStemsData)) {
    if (!hd || !hd.hiddenStems) continue;
    const stems = hd.hiddenStems.map(hs => 
      `${hs.stemEn} (${hs.element}, ${hs.depth} energy)`
    ).join(', ');
    parts.push({
      position: pos,
      positionTitle: positionDescriptions[pos] || pos,
      branch: hd.branchEn,
      animal: EARTHLY_BRANCHES[hd.branch]?.animal || '',
      hiddenStems: stems,
      summary: `Your ${pos.toUpperCase()} Pillar (${EARTHLY_BRANCHES[hd.branch]?.animal || hd.branch}) contains: ${stems}. These hidden energies add depth and nuance to your ${positionDescriptions[pos].toLowerCase()}.`,
    });
  }

  return {
    intro: 'Beyond the visible stems in your pillars, each earthly branch contains hidden stems that add layers of complexity to your chart. These hidden energies represent your subconscious influences, latent talents, and unexpressed potentials.',
    positions: parts,
    totalCount: Object.keys(hiddenStemsData).length,
  };
}

/**
 * Generate Ten Deities analysis
 */
function generateTenDeitiesAnalysis(tenDeities, dm) {
  if (Object.keys(tenDeities).length === 0) return null;
  
  const pillars = ['year', 'month', 'day', 'hour'];
  const pillarMeanings = {
    year: 'family background, early upbringing, and ancestral influences',
    month: 'career path, social standing, and professional relationships',
    day: 'your essential self and intimate partnerships',
    hour: 'creative expression, inner thoughts, and later years',
  };

  const deities = [];
  for (const pos of pillars) {
    const d = tenDeities[pos];
    if (!d) continue;
    deities.push({
      position: pos,
      pillarMeaning: pillarMeanings[pos] || pos,
      stem: d.stemEn,
      element: d.element,
      polarity: d.polarity,
      name: d.tenGodEn,
      subtitle: d.tenGodSubtitle || '',
      psychology: d.tenGodPsychology || '',
    });
  }

  return {
    intro: `The Ten Deities reveal how your energies interact with each other and with the world. Each pillar's stem takes on a specific role relative to your Day Master (${dm.en} — ${dm.archetype}).`,
    deities,
  };
}

/**
 * Generate branch interaction analysis
 */
function generateBranchInteractionAnalysis(interactions) {
  if (!interactions || interactions.length === 0) return null;

  return {
    intro: 'The earthly branches in your pillars interact with each other in complex ways — forming combinations that amplify, clashes that create tension, and punishments that indicate subtle frictions. These interactions add a dynamic dimension to your chart.',
    interactions: interactions.map(int => ({
      type: int.type,
      positions: int.positions,
      branches: int.branchesEn,
      description: int.description,
    })),
  };
}

/**
 * Generate Da Yun analysis
 */
function generateDaYunAnalysis(daYun, dm) {
  if (!daYun || !daYun.pillars || daYun.pillars.length === 0) return null;

  return {
    intro: `Your Luck Cycles are 10-year chapters of your life, each with a distinct energetic theme. These cycles are calculated based on your gender and the position of your Month Pillar at birth — they reveal the major seasons of your life's journey.`,
    direction: daYun.direction,
    startingAge: daYun.startingAge,
    pillars: daYun.pillars.map(p => ({
      pillar: p.pillar,
      ageRange: p.ageRange,
      yearRange: p.yearRange,
      stem: p.stemEn,
      stemElement: p.stemElement,
      branch: p.branchEn,
      animal: p.branchAnimal,
    })),
  };
}

/**
 * Generate annual forecast content
 */
function generateAnnualForecastContent(forecasts) {
  if (!forecasts || forecasts.length === 0) return null;

  return {
    intro: 'The energy of each year interacts with your birth chart in unique ways. Below is a year-by-year forecast that shows how the annual elements engage with your Four Pillars.',
    years: forecasts.map(f => ({
      year: f.year,
      stem: f.stemEn,
      animal: f.animal,
      element: f.stemElement,
      relationship: f.relationship,
      branchInteractions: f.branchInteractions || [],
    })),
  };
}

function generateEnergyForecast(dm, percentages, isGrandMaster) {
  const dominant = getDominantElement(percentages);
  const dmElement = dm.element || '';
  const baseElement = dmElement.replace('Yang ', '').replace('Yin ', '');

  const forecasts = {
    Wood: 'The coming years favor expansion and growth. Plant seeds now for what you wish to harvest in 3-5 years. Your energy is naturally rising — channel it into projects that have long-term potential. Avoid overextending; the tallest trees have the deepest roots.',
    Fire: 'This is a time of visibility and recognition. Your natural charisma is at its peak. Step into the spotlight and share your gifts with the world. Opportunities for leadership and creative expression abound. Guard against burnout — even the sun sets each day.',
    Earth: 'Stability and consolidation are the themes ahead. Focus on strengthening your foundations — in relationships, finances, and health. This is a season for building, not venturing into new territory. The harvest comes to those who have prepared the soil.',
    Metal: 'A period of refinement and cutting away what no longer serves you. Make decisive choices. Clear the clutter from your life — relationships, habits, and possessions that do not align with your highest self. This clearing creates space for what is to come.',
    Water: 'Deep wisdom is available to you now. Spend time in reflection and study. Your intuition is heightened — trust the subtle messages you receive. Strategic planning done now will pay dividends in the years ahead. Flow with, not against, the currents of change.',
  };

  const userForecast = forecasts[baseElement] || 'The cosmic energies are shifting in your favor. Stay attuned to your intuition and embrace the changes coming your way.';

  const shortForecast = `Based on your ${dmElement} Day Master and the dominance of ${dominant.element} (${dominant.percentage}%) in your chart, your energy forecast for the coming year emphasizes ${dominant.element.toLowerCase()} qualities. ${userForecast}`;

  if (isGrandMaster) {
    return {
      summary: userForecast,
      detailed: shortForecast,
    };
  }

  return { summary: userForecast, detailed: shortForecast };
}

function generateFiveElementsBalance(percentages, dominant) {
  const entries = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  let desc = '';

  if (entries[0][1] >= 38) {
    desc = `${entries[0][0]} dominates your energy profile at ${entries[0][1]}%. This concentration gives you powerful ${entries[0][0].toLowerCase()} characteristics but also creates an energetic imbalance. The elements that are weaker in your chart represent areas for development.`;
  } else if (entries[0][1] >= 25) {
    const topTwo = entries.slice(0, 2);
    desc = `${topTwo[0][0]} (${topTwo[0][1]}%) leads your chart, with ${topTwo[1][0]} (${topTwo[1][1]}%) providing complementary energy. This pairing creates a relatively balanced foundation.`;
  } else {
    desc = 'Your chart shows a well-distributed energy profile. No single element dominates excessively, giving you natural versatility and adaptability.';
  }

  const weakElements = entries.filter(([, pct]) => pct <= 5);
  if (weakElements.length > 0) {
    const weekNames = weakElements.map(e => e[0]);
    desc += ` You have ${weekNames.length === 1 ? 'a notably weak element' : 'notably weak elements'}: ${weekNames.join(', ')}. These represent your growth edges — areas where conscious cultivation can bring profound transformation.`;
  }

  return desc;
}

function generateLifeGuidance(dm, dominant, goalData) {
  return `${goalData.guidance} Your ${dm.element} Day Master combines with ${dominant.element} dominance (${dominant.percentage}%) to create a unique life path. ${goalData.advice}`;
}

function generateAffirmation(dm, baseElement) {
  const affirmations = {
    Wood: 'I grow with purpose, reaching toward my highest potential while staying rooted in my values. My journey is upward, but my foundation is strong.',
    Fire: 'I shine my light freely, knowing my warmth serves the world exactly as it is meant to. I rest when needed and burn brightly when called.',
    Earth: 'I am grounded and receptive, creating stability that nurtures all life around me. I stand firm while allowing change to flow through me.',
    Metal: 'I honor my truth with clarity and courage, cutting away what no longer serves my highest good. I am sharp where needed and gentle where wisdom demands.',
    Water: 'I flow with wisdom and grace, trusting the journey even when I cannot see the destination. My depth is my gift; I share it freely.',
  };
  return affirmations[baseElement] || 'I embrace my unique cosmic blueprint and trust the journey of my destiny. My elements are my teachers, and life is my curriculum.';
}

function generateFullElementDetail(fullPercentages) {
  const entries = Object.entries(fullPercentages).sort((a, b) => b[1] - a[1]);
  return entries.map(([elem, pct]) => {
    const insight = getElementInsight(elem, pct);
    return { element: elem, percentage: pct, insight };
  });
}

module.exports = {
  generateFullReport,
};
