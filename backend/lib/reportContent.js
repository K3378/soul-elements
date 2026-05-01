/**
 * Soul Elements — Report Content Generator
 * 
 * Generates tiered report content:
 * - Free: 2 lines per section (for preview)
 * - Standard ($49): 10+ pages
 * - Grand Master ($99): 20+ pages
 * 
 * v2 — Level 2 depth upgrade: each function now returns 3-5 paragraph detailed analysis
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
      love: 'You need a partner who appreciates your emotional depth and provides steady reassurance. You seek connections that nurture your soul.',
      innerPath: 'Your path is one of deepening. As you go inward, you discover the light that guides others.',
      communication: 'Warm and thoughtful. You speak with empathy and often say exactly what someone needs to hear.',
      challenges: 'Your sensitivity, while a gift, can become a burden. Learning to shield your energy is essential.',
    },
  },
  'Earth': {
    yang: {
      name: 'Yang Earth (Wu) — The Mountain',
      archetype: 'The Mountain',
      traits: 'Stable, reliable, and deeply nurturing. Like a mountain, you are a source of strength for everyone around you, providing unwavering support and protection.',
      personality: 'You are the mountain — solid, steady, and enduring. Your presence brings stability to any situation. People turn to you in times of crisis because they instinctively know you will not falter. You have a deep, grounded wisdom that comes from being connected to the earth. You are patient, reliable, and incredibly loyal to those you love.',
      strengths: 'Stability, reliability, patience, nurturing, practical wisdom',
      weaknesses: 'Stubbornness, resistance to change, tendency to overprotect',
      career: 'Your grounded energy makes you excellent in real estate, construction, agriculture, banking, and any field that requires long-term thinking and reliability.',
      love: 'You seek a partner who values stability and loyalty. You love deeply and protect fiercely, offering a safe harbor in turbulent times.',
      innerPath: 'Your journey is about discovering that true strength includes the flexibility to adapt. Flow like water, even as you stand like stone.',
      communication: 'Measured and dependable. You choose your words carefully and mean what you say. You value actions over words.',
      challenges: 'Your resistance to change can become a prison. Learning when to let go is as important as learning when to hold firm.',
    },
    yin: {
      name: 'Yin Earth (Ji) — The Fertile Soil',
      archetype: 'The Fertile Soil',
      traits: 'Nurturing, receptive, and deeply intuitive. Like rich soil, you have the gift of making things grow — ideas, relationships, and communities.',
      personality: 'You are the fertile soil — warm, receptive, and life-giving. Your quiet strength nurtures everything around you. You have an extraordinary ability to see potential in people and situations, patiently cultivating growth over time. Your intuition about what others need is almost uncanny.',
      strengths: 'Nurturing, receptivity, patience, attention to detail, loyalty',
      weaknesses: 'Overgiving, difficulty setting boundaries, tendency to absorb others emotions',
      career: 'You excel in education, healthcare, hospitality, HR, counseling, and any career that involves supporting others growth.',
      love: 'You give your heart fully and seek a partner who recognizes the depth of your devotion. You need to feel appreciated and needed.',
      innerPath: 'Your purpose is to nurture, but the soil also needs rest. Learn to receive as well as you give.',
      communication: 'Gentle and supportive. You are a natural mediator who helps others feel heard and understood.',
      challenges: 'You give so much that you may deplete your own inner resources. Self-care is not optional for you.',
    },
  },
  'Metal': {
    yang: {
      name: 'Yang Metal (Geng) — The Bronze Blade',
      archetype: 'The Bronze Blade',
      traits: 'Decisive, just, and unyielding. Like a finely forged blade, you cut through confusion with clarity, demanding truth and justice.',
      personality: 'You are the bronze blade — sharp, precise, and unyielding in your pursuit of truth. Your mind cuts through ambiguity with surgical precision. You have a deep sense of justice and will not compromise your principles for comfort or convenience. You are naturally disciplined and value structure, order, and efficiency.',
      strengths: 'Decisiveness, justice, discipline, precision, resilience',
      weaknesses: 'Rigidity, harshness, difficulty compromising, tendency to isolate',
      career: 'Your sharp mind excels in law, engineering, finance, science, technology, and any field requiring precision and analytical clarity.',
      love: 'You need a partner who respects your independence and challenges your intellect. You seek a relationship built on mutual respect rather than emotional dependency.',
      innerPath: 'Your path is one of refinement. The sharpest blade is also the most vulnerable to breakage. Learn when to apply pressure and when to yield.',
      communication: 'Direct and uncompromising. You tell the truth even when it is uncomfortable. You respect those who can match your directness.',
      challenges: 'Your strength can become isolation. Learning softness, connection, and vulnerability is your growth edge.',
    },
    yin: {
      name: 'Yin Metal (Xin) — The Jewel',
      archetype: 'The Jewel',
      traits: 'Refined, elegant, and deeply sensitive. Like a precious gem, you possess rare beauty and clarity, formed under pressure over time.',
      personality: 'You are the jewel — formed under immense pressure into something beautiful and rare. Your refinement is unmistakable; you have an innate elegance that elevates everything you touch. Beneath your polished exterior lies deep sensitivity. You perceive subtleties that others miss, and your emotional intelligence is remarkable.',
      strengths: 'Elegance, sensitivity, refinement, creativity, insight',
      weaknesses: 'Perfectionism, vulnerability to criticism, tendency to withdraw',
      career: 'You excel in arts, design, jewelry, quality control, luxury goods, consulting, and any field requiring refined taste and attention to detail.',
      love: 'You seek a partner who appreciates your depth and refinement. You need to feel seen for who you truly are, not just what you present to the world.',
      innerPath: 'Your journey is about embracing your worth. You do not need to be perfect to be precious.',
      communication: 'Elegant and precise. You choose each word carefully, like a jeweler setting a stone.',
      challenges: 'Your sensitivity to criticism can hold you back. Remember: even diamonds must be cut to shine.',
    },
  },
  'Water': {
    yang: {
      name: 'Yang Water (Ren) — The Ocean',
      archetype: 'The Ocean',
      traits: 'Expansive, wise, and endlessly adaptable. Like the ocean, your depths hold ancient wisdom and your surface reflects the changing sky.',
      personality: 'You are the ocean — deep, vast, and endlessly mysterious. Your wisdom runs deep, accumulated over many experiences. You are remarkably adaptable, able to navigate any situation by finding the path of least resistance. Your expansive nature makes you a visionary, constantly thinking about the big picture and the long game.',
      strengths: 'Wisdom, adaptability, vision, intuition, depth',
      weaknesses: 'Emotional overwhelm, tendency to withdraw, difficulty with boundaries',
      career: 'Your depth makes you exceptional in philosophy, research, maritime, psychology, technology, and any field requiring strategic vision.',
      love: 'You seek a soul connection — someone who can dive into your depths without fear. You need a partner who gives you space to flow freely.',
      innerPath: 'Your purpose is to carry ancient wisdom into the future. Use your depths, but remember to visit the surface.',
      communication: 'Profound and expansive. You speak in layers, revealing only as much as your listener can receive.',
      challenges: 'Your depth can become isolation. The ocean communicates with the sky, the shore, and every creature within it. Connection is essential.',
    },
    yin: {
      name: 'Yin Water (Gui) — The Rain',
      archetype: 'The Rain',
      traits: 'Adaptable, fertile, and subtly powerful. Like gentle rain, you nourish everything you touch, bringing life to what seemed barren.',
      personality: 'You are the rain — gentle, life-giving, and quietly powerful. You move through the world with fluid grace, adapting to every situation while maintaining your essential nature. Your subtle approach belies your immense power; over time, even stone is worn smooth by water. You have a gift for finding the cracks in any system.',
      strengths: 'Adaptability, subtlety, persistence, nurturance, emotional intelligence',
      weaknesses: 'Overcaution, tendency to hide your power, difficulty asserting yourself',
      career: 'Your fluid nature makes you excellent in diplomacy, counseling, art, writing, spirituality, and any field requiring emotional intelligence.',
      love: 'You need a partner who recognizes your quiet strength. You seek a love that is steady and gentle, like rain falling on thirsty earth.',
      innerPath: 'You are here to nourish the world. But even the rain chooses where to fall.',
      communication: 'Gentle and persuasive. You rarely raise your voice, yet your words carry weight.',
      challenges: 'You may underestimate your own power. The quietest rain can transform deserts into gardens.',
    },
  },
};

function getElementType(baseElement, isYang) {
  desc = ELEMENT_DESCRIPTIONS[baseElement];
  if (!desc) return null;
  return isYang ? desc.yang : desc.yin;
}

const GOAL_GUIDANCE = {
  career: {
    section: 'Career & Life Path',
    guidance: 'Your Ba Zi chart reveals the natural currents of your career path. The elements present in your Day Master and Pillars indicate the types of work that will feel most fulfilling and the environments where you will naturally excel. Your Luck Cycles reveal the timing of career advancements, lateral moves, and periods where professional risks are more likely to yield positive results.',
    advice: 'Pay close attention to your Luck Cycles when making career decisions. Entering a Metal cycle may favor structure and hierarchy, while a Water cycle calls for flexibility and exploration. Your chart suggests that periods of high Element synergy (where incoming luck cycle elements complement your Day Master) are ideal for bold career moves.',
    luckyDirections: 'North, West',
    luckyColors: 'White, Gold, Blue',
  },
  love: {
    section: 'Love & Relationships',
    guidance: 'Your birth chart reveals deep truths about your approach to relationships. Your Day Master polarity and the configuration of your Hour and Day Pillars indicate both the kind of partner you are naturally drawn to and the relationship dynamics you need to grow. The interaction of elements between partners can create powerful synergy or challenging friction.',
    advice: 'The compatibility between two Ba Zi charts is determined by the interplay of their five elements. You are naturally drawn to partners whose Day Master element generates yours or is generated by yours — these relationships have built-in harmony. Relationships with controlling or conflicting elements can be more dynamic but require conscious effort and mutual understanding.',
    luckyDirections: 'Southwest, Northeast',
    luckyColors: 'Pink, Red, Earth tones',
  },
  peace: {
    section: 'Inner Peace & Spirituality',
    guidance: 'Your spiritual journey is encoded in your Four Pillars. The balance of elements in your chart indicates where you find inner peace and where you experience internal conflict. Your Day Masters polarity reveals your natural approach to spirituality, while the hidden stems in your branches point to deeper, often unconscious spiritual needs.',
    advice: 'Cultivating your missing or weak elements through meditation, environment, and lifestyle choices can bring profound inner balance. Your chart shows that peace is found not by eliminating challenges, but by understanding the cosmic conversation between your elements. Meditation practices aligned with your favorable element will be most effective.',
    luckyDirections: 'East, Center',
    luckyColors: 'Green, Purple',
  },
  all: {
    section: 'Complete Life Guidance',
    guidance: 'Your Ba Zi chart is a complete map of your lifes terrain. Every pillar, every element, every hidden stem and deity relationship contributes to the person you are and the person you are becoming. Understanding your cosmic blueprint gives you the power to make conscious choices aligned with your deepest nature.',
    advice: 'The integration of all aspects of your chart provides the most powerful guidance. Your Luck Cycles tell you when to act and when to wait. Your Element balance tells you where to develop and where to delegate. Your Ten Deities reveal how you relate to power, creativity, and authority. Together, they form a complete operating manual for your life.',
    luckyDirections: 'North, East, Center',
    luckyColors: 'All favorable shades',
  },
};

function getDominantElement(percentages) {
  if (!percentages) return { element: 'Balanced', percentage: 25 };
  const entries = Object.entries(percentages);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.length > 0 ? { element: entries[0][0], percentage: entries[0][1] } : { element: 'Balanced', percentage: 25 };
}

function getElementInsight(elem, pct) {
  if (pct >= 35) return `${elem} is strongly present in your chart at ${pct}%. This element significantly shapes your personality and life approach. Its qualities are amplified in your character.`;
  if (pct >= 20) return `${elem} at ${pct}% provides balanced energy in your chart. You express ${elem.toLowerCase()} qualities naturally but without overwhelming your overall profile.`;
  if (pct >= 10) return `${elem} at ${pct}% is present but moderate in your chart. You have access to ${elem.toLowerCase()} qualities but they are not dominant influences.`;
  return `${elem} at ${pct}% is understated in your chart. Cultivating ${elem.toLowerCase()} practices can bring more balance.`;
}

/**
 * Generate complete full report content
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
    pageCount: isGrandMaster ? '30+ pages — Grand Master Edition' : '20+ pages — Standard Edition',
  };
}

/**
 * Generate hidden stems guidance — v2 expanded with per-stem detailed meaning
 */
function generateHiddenStemsGuidance(hiddenStemsData) {
  const positions = ['year', 'month', 'day', 'hour'];
  const positionDescriptions = {
    year: 'Your Early Foundations & Family Heritage',
    month: 'Your Career & Social Expression',
    day: 'Your Core Self & Relationships',
    hour: 'Your Inner World & Later Years',
  };
  
  // Detailed meanings for each heavenly stem when it appears as a hidden stem
  const hiddenStemMeanings = {
    'Jia': 'represents the pioneer, the initiator, the one who breaks new ground',
    'Yi': 'embodies flexibility, growth through adaptability, the quiet force of nature',
    'Bing': 'signifies radiance, public recognition, the warmth that draws others close',
    'Ding': 'represents inner light, refined perception, spiritual illumination',
    'Wu': 'symbolizes stability, groundedness, the unwavering center',
    'Ji': 'embodies receptivity, nourishment, the power of patient cultivation',
    'Geng': 'represents decisiveness, justice, the sharp edge of truth',
    'Xin': 'signifies refinement, inner beauty forged through challenge',
    'Ren': 'embodies depth, wisdom, the vast consciousness of the ocean',
    'Gui': 'represents adaptability, hidden power, gentle persistence over time',
  };

  let parts = [];
  for (const [pos, hd] of Object.entries(hiddenStemsData)) {
    if (!hd || !hd.hiddenStems) continue;
    const stemsWithMeaning = hd.hiddenStems.map(hs => {
      const meaning = hiddenStemMeanings[hs.stemEn] || 'adds a layer of subtle influence';
      return {
        name: hs.stemEn,
        element: hs.element,
        depth: hs.depth,
        meaning: meaning,
        fullDesc: `${hs.stemEn} (${hs.element}) as a ${hs.depth} energy — ${meaning}.`
      };
    });
    
    const stemsList = stemsWithMeaning.map(s => s.fullDesc).join(' ');
    
    parts.push({
      position: pos,
      positionTitle: positionDescriptions[pos] || pos,
      branch: hd.branchEn,
      animal: EARTHLY_BRANCHES[hd.branch]?.animal || '',
      hiddenStems: stemsWithMeaning,
      summary: `Your ${pos.toUpperCase()} Pillar (${EARTHLY_BRANCHES[hd.branch]?.animal || hd.branch}) contains: ${stemsWithMeaning.map(s => s.name).join(', ')}. These hidden energies add depth and nuance to your ${positionDescriptions[pos].toLowerCase()}.`,
    });
  }

  return {
    intro: 'Beyond the visible stems in your pillars, each earthly branch contains hidden stems that add layers of complexity to your chart. These hidden energies represent your subconscious influences, latent talents, and unexpressed potentials. Think of them as the interior of a building — the visible structure is the earthly branch, but the hidden stems are the rooms, each with its own purpose and energy.',
    positions: parts,
    totalCount: Object.keys(hiddenStemsData).length,
    conclusion: 'Together, these hidden stems create a rich inner landscape that shapes your deepest motivations, your subconscious reactions, and the aspects of yourself that may only emerge under specific circumstances. Understanding them unlocks a deeper level of self-awareness.',
  };
}

/**
 * Generate Ten Deities analysis — v2 expanded with psychological depth
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

  const deityMeanings = {
    'Direct Officer': 'represents authority, discipline, and structure. It governs your relationship with rules, hierarchies, and responsibility.',
    'Indirect Officer': 'represents rebellion, innovation, and challenge to authority. It fuels entrepreneurship and unconventional paths.',
    'Direct Wealth': 'governs stable income, material security, and traditional wealth accumulation through steady effort.',
    'Indirect Wealth': 'represents windfall opportunities, speculation, and wealth through risk-taking and unconventional means.',
    'Peer': 'represents siblings, competitors, and equals. It governs your ability to collaborate and compete.',
    'Rob Wealth': 'represents friends, social circles, and shared resources. It can indicate either generous support or resource drain.',
    'Seal / Guardian': 'represents education, wisdom, mentorship, and protective energies. It governs intellectual growth and inner security.',
    'Eating God': 'represents creativity, self-expression, talent, and joy. It governs your ability to generate new ideas and find satisfaction.',
    'Hurt Officer': 'represents artistic expression, emotional depth, rebellion through creativity, and the courage to challenge norms.',
    'Servant / Output': 'mediates between self-expression and external demands, governing how you present your talents to the world.',
  };

  const deities = [];
  for (const pos of pillars) {
    const d = tenDeities[pos];
    if (!d) continue;
    const meaning = deityMeanings[d.tenGodEn] || 'influences your approach to this life dimension';
    deities.push({
      position: pos,
      pillarMeaning: pillarMeanings[pos] || pos,
      stem: d.stemEn,
      element: d.element,
      polarity: d.polarity,
      name: d.tenGodEn,
      subtitle: d.tenGodSubtitle || '',
      psychology: d.tenGodPsychology || '',
      meaning: meaning,
      fullAnalysis: `In your chart, ${d.tenGodEn} appears in the ${pos.toUpperCase()} Pillar (${pillarMeanings[pos] || pos}). This deity ${meaning} When ${d.tenGodEn} appears in this specific pillar, it indicates that ${pos === 'year' ? 'your early environment shaped your relationship with this energy' : pos === 'month' ? 'your career path will engage strongly with this archetype' : pos === 'day' ? 'this energy is central to your identity and intimate relationships' : 'this influence will be particularly active in your later years and creative expression'}.'`,
    });
  }

  return {
    intro: `The Ten Deities reveal how your energies interact with each other and with the world. Each pillar's stem takes on a specific role relative to your Day Master (${dm.en} — ${dm.archetype}). These roles — part of the ancient Chinese understanding of archetypal relationships — illuminate how you approach authority, wealth, creativity, competition, and support.`,
    deities,
    conclusion: 'Understanding your Ten Deities gives you a profound map of your relational patterns — how you unconsciously react to authority, handle money, express creativity, and navigate competition. These patterns, once recognized, become choices rather than compulsions.',
  };
}

/**
 * Generate branch interaction analysis
 */
function generateBranchInteractionAnalysis(interactions) {
  if (!interactions || interactions.length === 0) return null;

  const interactionMeanings = {
    combination: 'creates a powerful alliance of energies, amplifying the strengths of both branches and generating a third, transformative energy. These combinations are generally auspicious and indicate areas where synergy naturally occurs in your life.',
    clash: 'creates productive tension between opposing forces. Like two stones striking together to create a spark, clashes generate friction that can either produce light and heat or wear both down. The outcome depends on the overall balance of your chart.',
    punishment: 'indicates a subtle friction that operates beneath the surface. Unlike clashes, punishments do not manifest as overt conflict but as a slow, corrosive tension that requires conscious awareness to resolve.',
    harm: 'represents a subtle undermining energy, like water slowly eroding stone. Harm relationships between branches indicate areas where patience and careful navigation are required.',
  };

  return {
    intro: 'The earthly branches in your pillars interact with each other in complex ways — forming combinations that amplify, clashes that create tension, and punishments that indicate subtle frictions. These interactions add a dynamic dimension to your chart. Understanding them helps you navigate relationships and timing with greater awareness.',
    interactions: interactions.map(int => ({
      type: int.type,
      positions: int.positions,
      branches: int.branchesEn,
      description: int.description,
      meaning: interactionMeanings[int.type] || 'creates a dynamic energy exchange between these positions in your chart.',
    })),
  };
}

/**
 * Generate Da Yun analysis — v2 expanded with per-cycle detailed life guidance
 */
function generateDaYunAnalysis(daYun, dm) {
  if (!daYun || !daYun.pillars || daYun.pillars.length === 0) return null;

  const cycleGuidance = (pillar, ageRange, dmElement) => {
    const stemGuidance = {
      'Jia': 'This cycle brings Yang Wood energy — a time of pioneering, growth, and establishing new foundations. Leadership opportunities will emerge, and your capacity to inspire others is amplified.',
      'Yi': 'Yin Wood energy prevails — flexibility and adaptation will serve you better than force. This is a period for strategic alliances, creative collaborations, and patient growth.',
      'Bing': 'Yang Fire radiates — visibility and recognition increase. Your social influence expands. This is a time to step into the spotlight and share your authentic self with the world.',
      'Ding': 'Yin Fire energy brings refinement and inner illumination. Your intuition sharpens. This is a period for spiritual depth, artistic expression, and cultivating meaningful relationships.',
      'Wu': 'Yang Earth brings stability and consolidation. Your foundations strengthen. This cycle favors real estate, long-term investments, and building lasting structures in your life.',
      'Ji': 'Yin Earth energy nourishes and sustains. This is a period of service, caregiving, and patient cultivation. Your ability to support others reaches its peak.',
      'Geng': 'Yang Metal cuts through confusion. This is a decisive cycle for making difficult choices, cutting away what no longer serves, and pursuing justice or truth with clarity.',
      'Xin': 'Yin Metal refines and elevates. Your taste, discernment, and attention to detail are heightened. This period favors quality over quantity in all endeavors.',
      'Ren': 'Yang Water brings depth and expansion. Your vision expands to encompass the big picture. This is a cycle for strategic thinking, philosophical exploration, and long-range planning.',
      'Gui': 'Yin Water flows with adaptability. This is a cycle for navigating change with grace, building deep connections, and trusting your intuition to guide you through uncertain waters.',
    };

    const guide = stemGuidance[pillar.stemEn] || 'This cycle carries a unique energetic signature that will interact with your birth chart in specific ways.';
    const elementNote = pillar.stemElement === dmElement.replace('Yang ', '').replace('Yin ', '')
      ? ' This cycle shares the same base element as your Day Master — your natural energy is amplified, for good and for challenge. The strengths of your personality become more pronounced, but so do your blind spots.'
      : ` This cycle introduces ${pillar.stemElement} energy, which ${GENERATING_CYCLE[pillar.stemElement] === dmElement || GENERATING_CYCLE[dmElement] === pillar.stemElement ? 'harmonizes with your Day Master, creating a supportive current' : 'interacts dynamically with your Day Master, creating both opportunities and friction'}.`;

    return `${guide}${elementNote}`;
  };

  return {
    intro: `Your Luck Cycles are 10-year chapters of your life, each with a distinct energetic theme. These cycles are calculated based on your gender and the position of your Month Pillar at birth — they reveal the major seasons of your life's journey. Each cycle brings a new elemental combination that interacts with your birth chart, shaping the opportunities, challenges, and lessons of that decade.`,
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
      guidance: cycleGuidance(p, p.ageRange, dm.element),
    })),
    conclusion: 'The Luck Cycles provide the temporal dimension of your Ba Zi chart — they tell you not just who you are, but when to act, when to wait, when to push forward, and when to consolidate your gains. Mastering this timing is one of the most powerful applications of Ba Zi wisdom.',
  };
}

/**
 * Generate annual forecast content — v2 expanded with per-year detailed analysis
 */
function generateAnnualForecastContent(forecasts) {
  if (!forecasts || forecasts.length === 0) return null;

  const annualGuidance = (f) => {
    const interactions = f.branchInteractions && f.branchInteractions.length > 0
      ? f.branchInteractions.join(', ') + '.'
      : 'The annual branch energy interacts subtly with your chart, creating a supportive background current for the years activities.';

    return `The year of the ${f.animal} (${f.stemEn} ${f.branchEn}) brings ${f.stemElement} energy into your life. ${f.relationship || 'This years energy creates a dynamic interaction with your Day Master, influencing your decisions and experiences.'}. ${interactions} This combination suggests that ${f.stemElement === 'Wood' ? 'opportunities for growth and new beginnings are prominent. Focus on planting seeds for the future' : f.stemElement === 'Fire' ? 'visibility and creative expression are highlighted. Share your gifts with confidence' : f.stemElement === 'Earth' ? 'stability and consolidation are the themes. Focus on strengthening your foundations' : f.stemElement === 'Metal' ? 'clarity and decisive action are favored. Cut away what no longer serves you' : 'adaptability and deep wisdom are your allies. Flow with change and trust your intuition'}.`;
  };

  return {
    intro: 'The energy of each year interacts with your birth chart in unique ways. Below is a year-by-year forecast that shows how the annual elements engage with your Four Pillars. These forecasts provide practical guidance for navigating each years opportunities and challenges.',
    years: forecasts.map(f => ({
      year: f.year,
      stem: f.stemEn,
      animal: f.animal,
      element: f.stemElement,
      relationship: f.relationship,
      branchInteractions: f.branchInteractions || [],
      analysis: annualGuidance(f),
    })),
    conclusion: 'Annual forecasts are powerful tools for timing your decisions. By understanding which years support your goals and which years call for patience, you can move through life with greater awareness and strategic alignment.',
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

  // Extended forecast with cultivation practices
  const elementPractices = {
    Wood: 'To harmonize with Wood energy, spend time in nature, start new projects early in the year, practice stretching and flexibility exercises, eat green leafy vegetables, and surround yourself with plants. The color green and the direction East will support your energy.',
    Fire: 'To harmonize with Fire energy, prioritize joy and play, spend time in sunlight, practice heart-opening exercises, eat warm foods and red-colored fruits, and express yourself creatively. The color red and the direction South will amplify positive Fire energy.',
    Earth: 'To harmonize with Earth energy, establish consistent routines, spend time grounding (walk barefoot on soil), practice mindful eating with root vegetables, create a stable home environment, and work with clay or soil. The color yellow and the direction Center will stabilize your energy.',
    Metal: 'To harmonize with Metal energy, declutter your living space, practice precision activities (calligraphy, martial arts, cooking), breathe deeply, eat white-colored foods, and set clear boundaries. The color white and the direction West will clarify your path.',
    Water: 'To harmonize with Water energy, spend time near bodies of water, practice meditation and contemplation, drink plenty of water, eat dark-colored and salty foods, and embrace stillness. The color blue and the direction North will deepen your wisdom.',
  };

  const extendedForecast = `${shortForecast}\n\n${elementPractices[baseElement] || 'Cultivate balance through mindfulness and alignment with your natural rhythms.'}\n\nRemember that your energy forecast is a weather report, not a destiny. It describes the prevailing conditions — but you are the captain of your ship. Knowing the weather allows you to prepare your sails, not to stay in port.`;

  if (isGrandMaster) {
    return {
      summary: userForecast,
      detailed: shortForecast,
      extended: extendedForecast,
      cultivationPractices: elementPractices[baseElement] || '',
    };
  }

  return { summary: userForecast, detailed: shortForecast, extended: shortForecast, cultivationPractices: elementPractices[baseElement] || '' };
}

/**
 * Generate five elements balance — v2 expanded with per-element therapy and detailed analysis
 */
function generateFiveElementsBalance(percentages, dominant) {
  const entries = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  let parts = [];

  // Part 1: Dominance analysis
  if (entries[0][1] >= 38) {
    parts.push(`${entries[0][0]} dominates your energy profile at ${entries[0][1]}%. This concentration gives you powerful ${entries[0][0].toLowerCase()} characteristics but also creates an energetic imbalance. The elements that are weaker in your chart represent areas for development and growth. When one element so dominates, it can suppress the expression of other qualities, potentially leading to overcompensation in some areas of life and neglect in others.`);
  } else if (entries[0][1] >= 25) {
    const topTwo = entries.slice(0, 2);
    parts.push(`${topTwo[0][0]} (${topTwo[0][1]}%) leads your chart, with ${topTwo[1][0]} (${topTwo[1][1]}%) providing complementary energy. This pairing creates a relatively balanced foundation. The interplay between these two leading elements shapes your core character — ${topTwo[0][0].toLowerCase()} provides its distinctive qualities while ${topTwo[1][0].toLowerCase()} adds nuance and depth.`);
  } else {
    parts.push('Your chart shows a well-distributed energy profile. No single element dominates excessively, giving you natural versatility and adaptability. This balance is a gift — you can draw on multiple energies as situations demand, making you highly adaptable across different life contexts.');
  }

  // Part 2: Weak element analysis
  const weakElements = entries.filter(([, pct]) => pct <= 8);
  if (weakElements.length > 0) {
    const weakNames = weakElements.map(e => `${e[0]} (${e[1]}%)`);
    const therapyTips = {
      'Wood': 'To cultivate Wood energy: spend time in forests or gardens, start new creative projects, practice morning stretching, eat leafy greens, and surround yourself with plants.',
      'Fire': 'To cultivate Fire energy: seek warm sunlight, engage in passionate conversations, practice heart-opening exercises, eat warm foods, and express yourself through creative arts.',
      'Earth': 'To cultivate Earth energy: establish stable routines, walk barefoot on grass or soil, practice mindful eating with root vegetables, and create a nurturing home environment.',
      'Metal': 'To cultivate Metal energy: declutter your space, practice deep breathing, establish clear boundaries, eat white-colored foods, and engage in precision practices.',
      'Water': 'To cultivate Water energy: spend time near water, practice meditation, drink plenty of water, eat dark-colored foods, and embrace periods of quiet reflection.',
    };
    const therapies = weakElements.map(e => therapyTips[e[0]] || '').filter(Boolean);
    parts.push(`You have notably weak elements: ${weakNames.join(', ')}. These represent your growth edges — areas where conscious cultivation can bring profound transformation. ${therapies.join(' ')}`);
  }

  // Part 3: Element cycle context
  const genCycle = {
    'Wood': 'Wood generates Fire, so when Wood is strong, Fire tends to flourish as well.',
    'Fire': 'Fire generates Earth, so strong Fire energy tends to produce stabilizing Earth qualities.',
    'Earth': 'Earth generates Metal, so Earth supports the refinement and structure of Metal.',
    'Metal': 'Metal generates Water, so Metal energy tends to create deep, flowing Water qualities.',
    'Water': 'Water generates Wood, so Water energy nourishes the growth and expansion of Wood.',
  };
  const ctrlCycle = {
    'Wood': 'Wood controls Earth, so strong Wood can suppress Earth qualities.',
    'Fire': 'Fire controls Metal, so strong Fire can overwhelm Metal energy.',
    'Earth': 'Earth controls Water, so strong Earth can dam and restrict Water flow.',
    'Metal': 'Metal controls Wood, so strong Metal can cut down Wood energy.',
    'Water': 'Water controls Fire, so strong Water can extinguish Fire.',
  };
  
  if (dominant.element) {
    parts.push(`In the generating cycle, ${genCycle[dominant.element] || ''} In the controlling cycle, ${ctrlCycle[dominant.element] || ''} Understanding these relationships helps you see how your dominant element influences your entire energetic ecosystem.`);
  }

  // Part 4: Balance recommendation
  const strongest = entries[0];
  const weakest = entries[entries.length - 1];
  if (strongest && weakest && strongest[0] !== weakest[0]) {
    parts.push(`Your chart shows a notable contrast between ${strongest[0]} (${strongest[1]}%) and ${weakest[0]} (${weakest[1]}%). The path to greater harmony lies not in eliminating your dominant element's qualities, but in consciously cultivating the weaker elements to create a more balanced expression of your full potential. The goal is not perfect equality among elements, but functional harmony where no single element overwhelms the others.`);
  }

  return parts.join('\n\n');
}

/**
 * Generate life guidance — v2 expanded
 */
function generateLifeGuidance(dm, dominant, goalData) {
  const dmElement = dm.element || '';
  const baseElement = dmElement.replace('Yang ', '').replace('Yin ', '');
  
  const elementAdvice = {
    Wood: 'As a Wood Day Master, your life path is one of growth and expansion. You are here to build, to lead, and to create structures that outlast you. Your natural inclination is to reach upward — but remember that deep roots are what enable great height.',
    Fire: 'As a Fire Day Master, your life path is one of illumination and connection. You are here to shine, to warm others, and to bring light to dark places. Your natural inclination is to radiate outward — but remember that even the brightest flame needs fuel and rest.',
    Earth: 'As an Earth Day Master, your life path is one of service and stability. You are here to nurture, to ground, and to create the foundations upon which others can build. Your natural inclination is to support — but remember that the giver also needs to receive.',
    Metal: 'As a Metal Day Master, your life path is one of refinement and truth. You are here to clarify, to structure, and to cut through illusion with precision. Your natural inclination is to perfect — but remember that the sharpest blade is also the most fragile.',
    Water: 'As a Water Day Master, your life path is one of wisdom and flow. You are here to adapt, to reflect, and to carry ancient wisdom into new territories. Your natural inclination is to explore depth — but remember that you also need the surface to breathe.',
  };

  const elementPara = elementAdvice[baseElement] || 'Your Day Master element shapes your fundamental approach to life. Understanding its qualities helps you align your choices with your deepest nature.';
  
  return `${goalData.guidance}\n\n${elementPara} Your ${dmElement} Day Master combines with ${dominant.element} dominance (${dominant.percentage}%) to create a unique life path. ${goalData.advice}`;
}

/**
 * Generate affirmation — v2 expanded
 */
function generateAffirmation(dm, baseElement) {
  const affirmations = {
    Wood: 'I grow with purpose, reaching toward my highest potential while staying rooted in my values. My journey is upward, but my foundation is strong.\n\nI trust the process of growth — each season of my life prepares me for the next. I am patient with myself as I become who I am meant to be.',
    Fire: 'I shine my light freely, knowing my warmth serves the world exactly as it is meant to. I rest when needed and burn brightly when called.\n\nI am not dimmed by sharing my light. The more I give, the more I am replenished. My joy is my power, and I share it without fear.',
    Earth: 'I am grounded and receptive, creating stability that nurtures all life around me. I stand firm while allowing change to flow through me.\n\nI am the center that holds. From my stability, others find their footing. I nurture without losing myself, support without depleting my own resources.',
    Metal: 'I honor my truth with clarity and courage, cutting away what no longer serves my highest good. I am sharp where needed and gentle where wisdom demands.\n\nI trust my discernment. I know when to act and when to wait. My precision is a gift, and I wield it with compassion.',
    Water: 'I flow with wisdom and grace, trusting the journey even when I cannot see the destination. My depth is my gift; I share it freely.\n\nI trust the currents of my life, knowing that every twist and turn carries me where I need to go. I am vast enough to hold all my experiences.',
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
  ELEMENT_DESCRIPTIONS,
  getElementType,
};
