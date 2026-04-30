'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ background: '#07080A', paddingTop: '10vh', paddingBottom: '10vh' }}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            About Soul Elements
          </h1>
          <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: '#C9A84C', opacity: 0.5 }} />
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: '#F7F8F8', lineHeight: '1.8' }}>
            Soul Elements is a modern Ba Zi (Four Pillars of Destiny) reading platform. We combine ancient Chinese metaphysical wisdom with modern computational accuracy to provide personalized destiny readings.
          </p>
        </div>

        {/* What is Ba Zi */}
        <div className="mb-10 p-6 rounded-lg" style={{ background: 'rgba(15,17,17,0.95)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            What Is Ba Zi?
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(247,248,248,0.7)', lineHeight: '1.8' }}>
            Ba Zi, also known as the Four Pillars of Destiny, is a 2,500-year-old Chinese metaphysical system that maps the cosmic energies present at the moment of your birth. Unlike Western astrology, which observes planetary positions, Ba Zi uses the Chinese Solar Calendar and the interaction of Heavenly Stems with Earthly Branches to reveal your innate nature, strengths, challenges, and life path.
          </p>
        </div>

        {/* Day Master */}
        <div className="mb-10 p-6 rounded-lg" style={{ background: 'rgba(15,17,17,0.95)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Day Master
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(247,248,248,0.7)', lineHeight: '1.8' }}>
            The Day Master is the Heavenly Stem of your Day Pillar — the core of your Ba Zi chart. It represents your essential self, your innate personality, and how you express your individuality in the world. There are ten possible Day Masters, each corresponding to one of the Five Elements (Wood, Fire, Earth, Metal, Water) in either its Yin or Yang polarity. Understanding your Day Master is the first step to knowing how you interact with the world and what energies nourish or challenge you.
          </p>
        </div>

        {/* Five Elements */}
        <div className="mb-10 p-6 rounded-lg" style={{ background: 'rgba(15,17,17,0.95)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            The Five Elements Analysis
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(247,248,248,0.7)', lineHeight: '1.8' }}>
            The Five Elements — Wood, Fire, Earth, Metal, and Water — form the foundation of all Ba Zi analysis. These elements interact in two primary cycles: the Generating Cycle (Sheng), where each element nourishes the next, and the Controlling Cycle (Ke), where each element restrains another. Your Ba Zi chart reveals which elements are strong or weak in your natal chart, and this balance determines your natural inclinations, talents, and areas of growth. A harmonious elemental balance indicates smooth life flow, while imbalances point to areas requiring awareness and cultivation.
          </p>
        </div>

        {/* 10-Year Luck Cycles */}
        <div className="mb-10 p-6 rounded-lg" style={{ background: 'rgba(15,17,17,0.95)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            10-Year Luck Cycles
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(247,248,248,0.7)', lineHeight: '1.8' }}>
            Luck Cycles (Da Yun) are ten-year periods that overlay your natal Ba Zi chart, shifting the elemental energies you experience as you move through life. Calculated from your birth date and gender, these cycles reveal the prevailing themes and opportunities of each decade of your life. Understanding your current Luck Cycle helps you make aligned decisions about career, relationships, health, and personal development — working with the cosmic weather rather than against it.
          </p>
        </div>

        {/* Our Approach */}
        <div className="mb-10 p-6 rounded-lg" style={{ background: 'rgba(15,17,17,0.95)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#3B82F6' }}>
            Our Approach
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(247,248,248,0.7)', lineHeight: '1.8' }}>
            We approach Ba Zi with deep respect for its Chinese origins and classical Zi Ping methodology. Our platform combines traditional scholarship with modern software engineering to deliver accurate, personalized readings. Every calculation is based on established algorithms derived from classical texts, and our reports provide clear, practical guidance you can apply to your life.
          </p>
        </div>

        {/* Footer link */}
        <div className="text-center mt-12">
          <a href="/" className="inline-block text-sm font-medium px-6 py-2.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
