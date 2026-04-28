'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '10vh' }}>
      {/* Tai Chi Icon (static) */}
      <div className="mb-8" style={{ opacity: 0.8 }}>
        <svg width="72" height="72" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.6" />
          <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.7" />
          <circle cx="50" cy="74" r="8" fill="#05070F" />
          <circle cx="50" cy="26" r="8" fill="#C9A84C" />
        </svg>
      </div>

      {/* Hero */}
      <h1 className="text-5xl md:text-7xl font-bold text-center mb-4"
          style={{ color: '#E8E4D8', letterSpacing: '-0.02em' }}>
        Discover Your
        <br />
        <span style={{ color: '#C9A84C' }}>Soul Element</span>
      </h1>

      <p className="text-base md:text-lg text-center mb-12 max-w-lg"
         style={{ color: '#6B6F80', lineHeight: '1.7' }}>
        Ancient Chinese wisdom meets modern self-discovery.
        Unlock the blueprint of your destiny through the Four Pillars of Destiny.
      </p>

      {/* CTA */}
      <button onClick={() => router.push('/input')}
              className="btn-gold text-lg px-10 py-4">
        Begin Your Journey
      </button>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full mt-20">
        <div className="card-glass text-center p-6">
          <div className="text-2xl mb-3" style={{ color: '#C9A84C', opacity: 0.7 }}>☯</div>
          <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your True Self</h3>
          <p className="text-sm" style={{ color: '#6B6F80', lineHeight: '1.6' }}>
            Discover your Day Master — the core energy that defines your personality and life path.
          </p>
        </div>
        <div className="card-glass text-center p-6">
          <div className="text-2xl mb-3" style={{ color: '#C9A84C', opacity: 0.7 }}>✦</div>
          <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Five Elements</h3>
          <p className="text-sm" style={{ color: '#6B6F80', lineHeight: '1.6' }}>
            Understand the cosmic balance of Wood, Fire, Earth, Metal, and Water within you.
          </p>
        </div>
        <div className="card-glass text-center p-6">
          <div className="text-2xl mb-3" style={{ color: '#C9A84C', opacity: 0.7 }}>♾</div>
          <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Life Roadmap</h3>
          <p className="text-sm" style={{ color: '#6B6F80', lineHeight: '1.6' }}>
            Navigate your future with clarity. Your personal energy trends and opportunities await.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full mt-16 mb-24">
        <div className="card-glass text-center p-8">
          <h3 className="text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Standard</h3>
          <div className="text-4xl font-bold mb-5 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>$49</div>
          <ul className="text-sm space-y-2 mb-8" style={{ color: '#6B6F80' }}>
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
        <div className="card-glass card-premium text-center p-8">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C9A84C', opacity: 0.7 }}>Most Comprehensive</div>
          <h3 className="text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Grand Master</h3>
          <div className="text-4xl font-bold mb-5 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>$99</div>
          <ul className="text-sm space-y-2 mb-8" style={{ color: '#6B6F80' }}>
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
