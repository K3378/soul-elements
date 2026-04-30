'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const PREVIEW_PAGES = [
  {
    title: 'Cover',
    heading: 'SOUL ELEMENTS — DESTINY AUDIT',
    previewLines: [
      'Your personal destiny audit.',
      'Day Master: Gui (Yin Water) — The Gentle Rain.',
      'Standard Edition | CONFIDENTIAL',
    ],
  },
  {
    title: 'Document Structure',
    heading: 'DOCUMENT STRUCTURE',
    previewLines: [
      'Standard Edition — 12 Page Breakdown.',
      'Eight sections covering your complete destiny analysis.',
    ],
  },
  {
    title: 'Architectural Chart',
    heading: 'ARCHITECTURAL CHART',
    previewLines: [
      'Four Pillars of Destiny.',
      'Year | Month | Day | Hour — each pillar reveals a different life dimension.',
    ],
  },
  {
    title: 'Pillar Deep Analysis',
    heading: 'PILLAR DEEP ANALYSIS',
    previewLines: [
      'Stem & Branch Interactions.',
      'YEAR PILLAR: Ding Chou (Fire Ox) — family heritage and foundation.',
      'MONTH PILLAR: Bing Wu (Fire Horse) — career and social standing.',
    ],
  },
  {
    title: 'Elemental Distribution',
    heading: 'ELEMENTAL DISTRIBUTION',
    previewLines: [
      'Five Elements with Weighted Percentages.',
      'Fire 33% | Water 27% | Wood 21% | Earth 15% | Metal 3%',
      'Detailed bar chart showing your elemental composition.',
    ],
  },
  {
    title: 'Element Balance',
    heading: 'ELEMENT BALANCE & CYCLE ANALYSIS',
    previewLines: [
      'Five Element Cycle Assessment.',
      'Your chart presents a classic Fire-Water tension dynamic...',
    ],
  },
  {
    title: 'Hidden Stems',
    heading: 'HIDDEN STEMS',
    previewLines: [
      'Subconscious Energies in Every Branch.',
      'Every earthly branch contains hidden stem energies (藏干).',
    ],
  },
  {
    title: 'Ten Deities',
    heading: 'TEN DEITIES ANALYSIS',
    previewLines: [
      'Energetic Roles of Each Pillar.',
      'The Warrior (Year) | The Authority (Month) | The Rebel Genius (Hour)',
    ],
  },
  {
    title: 'Luck Cycles Overview',
    heading: 'LUCK CYCLES OVERVIEW',
    previewLines: [
      '10-Year Chapters of Destiny.',
      '6 luck cycles spanning from age 3 to 62.',
      'Fortune bars show good and challenging periods.',
    ],
  },
  {
    title: 'Annual Energy Forecast',
    heading: 'ANNUAL ENERGY FORECAST',
    previewLines: [
      '2025-2030 Year-by-Year Analysis.',
      '2025 — Jia Chen (Wood Dragon) | Initiation year.',
      '2026 — Yi Si (Wood Snake) | Networking and alliances.',
    ],
  },
  {
    title: 'Remediation Guide',
    heading: 'REMEDIATION GUIDE',
    previewLines: [
      'Environmental & Behavioral Adjustments.',
      'Strengthen Metal | Balance Fire | Optimize Career.',
      'Favorable directions, colors, and lucky numbers.',
    ],
  },
  {
    title: 'Personal Affirmation',
    heading: 'PERSONAL AFFIRMATION',
    previewLines: [
      'Your Elemental Mandate.',
      '"I honor the depth of my Water nature..."',
    ],
  },
];

function BlurredSection({ page, index, onUnlockClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-lg overflow-hidden mb-5 transition-all duration-200"
      style={{
        background: '#0a0a14',
        border: hovered ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(201,168,76,0.1)',
        boxShadow: hovered ? '0 0 30px rgba(201,168,76,0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Page number */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="text-[10px] font-semibold" style={{ color: '#434759', letterSpacing: '0.05em' }}>
          PAGE {index + 1} / 12
        </div>
        {/* Gold line */}
        <div className="w-8 h-0.5" style={{ background: '#C9A84C', opacity: 0.5 }}></div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {/* Section heading */}
        <div className="text-sm font-bold mb-3" style={{ color: '#C9A84C', letterSpacing: '0.03em' }}>
          {page.heading}
        </div>

        {/* Visible lines */}
        <div className="space-y-1.5 mb-3">
          {page.previewLines.map((line, li) => (
            <p key={li} className="text-[11px] leading-relaxed" style={{ color: li === 0 ? '#8B8FA0' : '#6B6F80', fontFamily: li === 0 ? "'Playfair Display', serif" : 'inherit' }}>
              {line}
            </p>
          ))}
        </div>

        {/* Blurred content area */}
        <div className="relative overflow-hidden rounded" style={{ minHeight: '120px' }}>
          <div className="space-y-2 opacity-30 select-none" style={{ filter: 'blur(5px)' }}>
            {[...Array(5)].map((_, li) => (
              <p key={li} className="text-[10px] leading-relaxed py-1" style={{ color: '#434759' }}>
                {li === 0 && 'The complete analysis reveals intricate patterns and hidden influences that shape your destiny across multiple dimensions of your life. Each section contains hundreds of words of personalized insight.'}
                {li === 1 && 'Detailed breakdown of elemental interactions reveals the complex interplay between your five cosmic energies. Understanding these relationships is key to harnessing your full potential.'}
                {li === 2 && 'Your unique birth configuration creates specific energetic patterns that influence your career trajectory, relationship dynamics, and personal growth path.'}
                {li === 3 && 'Ancient Chinese wisdom provides time-tested frameworks for understanding your strengths, challenges, and optimal life direction based on your Four Pillars.'}
                {li === 4 && 'The hidden influences within your chart reveal subconscious patterns and latent talents that, when brought to awareness, become powerful tools for transformation.'}
              </p>
            ))}
          </div>
          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{
            background: 'linear-gradient(to bottom, transparent, #0a0a14)'
          }}></div>
        </div>

        {/* Interactive unlock overlay */}
        <div className="mt-3 text-center">
          <button onClick={onUnlockClick}
            className="w-full py-2.5 rounded text-[11px] transition-all flex items-center justify-center gap-2"
            style={{
              background: hovered ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(201,168,76,0.2)',
              color: hovered ? '#C9A84C' : '#6B6F80',
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            {hovered ? 'Tap to unlock full content' : 'Full content locked'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const isTest = searchParams.get('test') === '1';
  const coupon = searchParams.get('coupon') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');
  const [scrollToPricing, setScrollToPricing] = useState(false);

  useEffect(() => {
    if (key) {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
        setLoading(false);
      } else {
        const dataStr = searchParams.get('data');
        if (dataStr) {
          try {
            const parsed = JSON.parse(decodeURIComponent(dataStr));
            setData(parsed);
          } catch(e) {}
        }
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (scrollToPricing) {
      setTimeout(() => {
        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
        setScrollToPricing(false);
      }, 100);
    }
  }, [scrollToPricing]);

  const handlePurchase = async (tier) => {
    setPurchaseLoading(tier);
    setPurchaseError('');

    if (isTest) {
      sessionStorage.setItem('test_report', JSON.stringify(data));
      window.location.href = `/report?test=1&tier=${tier}`;
      return;
    }

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reportData: data, coupon: coupon || undefined }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Checkout failed');
      }
    } catch (err) {
      setPurchaseError(err.message || 'Payment failed. Please try again.');
      setPurchaseLoading(null);
    }
  };

  if (!data) {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: '#6B6F80' }}>Calculating your destiny...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: '#6B6F80' }}>No data available. Please start again.</p>
          <a href="/" className="btn-gold inline-block mt-4">Start Again</a>
        </div>
      </div>
    );
  }

  const { bazi } = data;

  return (
    <>
      {/* Background image */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'url(/bg-design.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
      }} />
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '4vh', paddingBottom: '8vh' }}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Destiny Preview
          </h1>
          <p className="text-xs mt-1" style={{ color: '#434759' }}>
            {bazi.dayMaster.archetype} &middot; {bazi.dayMaster.element}
          </p>
        </div>

        {/* Four Pillars Mini */}
        <div className="mb-8 p-3 rounded-lg text-center" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const p = bazi.pillars[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="text-center">
                  <div className="text-[9px] uppercase mb-0.5" style={{ color: '#434759' }}>{pillar}</div>
                  <div className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-[10px]" style={{ color: '#C9A84C' }}>{p.animal}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.15)' }}></div>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#434759' }}>Preview — 12 Pages</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.15)' }}></div>
        </div>

        {/* 12 PREVIEW PAGES — scrollable down */}
        <div className="space-y-1">
          {PREVIEW_PAGES.map((pg, i) => (
            <BlurredSection
              key={i}
              page={pg}
              index={i}
              onUnlockClick={() => setScrollToPricing(true)}
            />
          ))}
        </div>

        {/* Divider before pricing */}
        <div className="flex items-center gap-3 my-10">
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }}></div>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#6B6F80' }}>Unlock Full Report</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.2)' }}></div>
        </div>

        {/* PRICING SECTION */}
        <div id="pricing-section" className="text-center mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Complete Destiny Awaits
          </h2>
          <p className="text-xs max-w-md mx-auto mb-8" style={{ color: '#434759', lineHeight: '1.6' }}>
            You&apos;ve seen a glimpse of 12 pages. The full report reveals your complete
            energy balance, hidden influences, luck cycles, and personalized life guidance —
            beautifully formatted as a professional PDF.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Standard */}
            <div className="rounded-lg p-5 flex flex-col text-left"
              style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Standard</h3>
              <div className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>$49</div>
              <ul className="text-[10px] space-y-1 mb-5 flex-1" style={{ color: '#6B6F80' }}>
                <li>12-page PDF report</li>
                <li>Day Master deep analysis</li>
                <li>Hidden Stems &amp; Ten Deities</li>
                <li>Five Elements energy chart</li>
                <li>5-year energy forecast</li>
                <li>Personal affirmation</li>
              </ul>
              <button onClick={() => handlePurchase('standard')} disabled={purchaseLoading !== null}
                className="w-full text-xs py-2.5 rounded transition-all"
                style={{ 
                  background: purchaseLoading === 'standard' ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: purchaseLoading === 'standard' ? '#8B8FA0' : '#C9A84C',
                }}>
                {purchaseLoading === 'standard' ? 'Redirecting...' : 'Unlock Standard'}
              </button>
            </div>

            {/* Grand Master */}
            <div className="rounded-lg p-5 flex flex-col text-left"
              style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 0 30px rgba(201,168,76,0.05)' }}>
              <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>Best Value</div>
              <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Grand Master</h3>
              <div className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>$99</div>
              <ul className="text-[10px] space-y-1 mb-5 flex-1" style={{ color: '#6B6F80' }}>
                <li>Everything in Standard, plus:</li>
                <li>20+ page comprehensive report</li>
                <li>10-Year Luck Cycle timeline</li>
                <li>Annual breakdown (2025-2030)</li>
                <li>Na Yin &amp; Shen Sha analysis</li>
                <li>Full personality profile</li>
                <li>Career &amp; wealth strategy</li>
              </ul>
              <button onClick={() => handlePurchase('grandmaster')} disabled={purchaseLoading !== null}
                className="w-full text-xs py-2.5 rounded transition-all"
                style={{ 
                  background: purchaseLoading === 'grandmaster' ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: purchaseLoading === 'grandmaster' ? '#8B8FA0' : '#C9A84C',
                }}>
                {purchaseLoading === 'grandmaster' ? 'Redirecting...' : 'Unlock Grand Master'}
              </button>
            </div>
          </div>
        </div>

        {purchaseError && (
          <div className="text-center mb-8">
            <p className="text-xs" style={{ color: 'rgba(255,80,80,0.8)' }}>{purchaseError}</p>
          </div>
        )}
      </div>    </div>
    </>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
