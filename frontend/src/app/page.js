'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Tai Chi Animation */}
      <div className="tai-chi-spin mb-8">
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
          <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
          <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
          <circle cx="50" cy="26" r="8" fill="#C9A84C" />
        </svg>
      </div>

      {/* Hero Text */}
      <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 fade-in-up"
          style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E5' }}>
        Discover Your
        <br />
        <span style={{ color: '#C9A84C' }}>Soul Element</span>
      </h1>

      <p className="text-lg md:text-xl text-center mb-12 max-w-xl"
         style={{ color: '#8B8FA3', fontFamily: "'Montserrat', sans-serif" }}>
        Ancient Chinese wisdom meets modern self-discovery.
        Unlock the blueprint of your destiny through the Four Pillars of Destiny.
      </p>

      {/* CTA Button */}
      <button onClick={() => router.push('/input')}
              className="btn-gold text-lg px-10 py-4 glow-gold fade-in-up"
              style={{ animationDelay: '0.3s' }}>
        Begin Your Journey
      </button>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20 w-full fade-in-up"
           style={{ animationDelay: '0.6s' }}>
        <div className="card-glass text-center">
          <div className="text-3xl mb-3" style={{ color: '#C9A84C' }}>☯</div>
          <h3 className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your True Self</h3>
          <p className="text-sm" style={{ color: '#8B8FA3' }}>
            Discover your Day Master — the core energy that defines your personality and life path.
          </p>
        </div>
        <div className="card-glass text-center">
          <div className="text-3xl mb-3" style={{ color: '#C9A84C' }}>✦</div>
          <h3 className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Five Elements</h3>
          <p className="text-sm" style={{ color: '#8B8FA3' }}>
            Understand the cosmic balance of Wood, Fire, Earth, Metal, and Water within you.
          </p>
        </div>
        <div className="card-glass text-center">
          <div className="text-3xl mb-3" style={{ color: '#C9A84C' }}>♾</div>
          <h3 className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Life Roadmap</h3>
          <p className="text-sm" style={{ color: '#8B8FA3' }}>
            Navigate your future with clarity. Your personal energy trends and opportunities await.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mt-20 w-full fade-in-up mb-20"
           style={{ animationDelay: '0.9s' }}>
        <div className="card-glass text-center border-gold">
          <h3 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Standard</h3>
          <div className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>$49</div>
          <ul className="text-sm space-y-2 mb-6" style={{ color: '#8B8FA3' }}>
            <li>15-page personalized report</li>
            <li>Day Master deep analysis</li>
            <li>Five Elements energy chart</li>
            <li>3-year energy forecast</li>
            <li>Personal affirmations</li>
          </ul>
          <button onClick={() => router.push('/input')} className="btn-gold w-full">
            Get Your Report
          </button>
        </div>
        <div className="card-glass text-center border-gold" style={{ borderColor: '#C9A84C' }}>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C9A84C' }}>Most Comprehensive</div>
          <h3 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Grand Master</h3>
          <div className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>$99</div>
          <ul className="text-sm space-y-2 mb-6" style={{ color: '#8B8FA3' }}>
            <li>Everything in Standard</li>
            <li>10-year strategic roadmap</li>
            <li>Annual breakdown (2025-2035)</li>
            <li>Fortune & feng shui guidance</li>
            <li>Premium PDF with custom design</li>
          </ul>
          <button onClick={() => router.push('/input?tier=grandmaster')} className="btn-gold w-full">
            Get Your Report
          </button>
        </div>
      </div>
    </div>
  );
}
