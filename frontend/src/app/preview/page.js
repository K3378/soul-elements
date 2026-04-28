'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const isTest = searchParams.get('test') === '1';
  const coupon = searchParams.get('coupon') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');

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

  const handlePurchase = async (tier) => {
    setPurchaseLoading(tier);
    setPurchaseError('');

    // TEST MODE: skip Stripe, go straight to report
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
          <p style={{ color: '#6B6F80' }}>Loading your reading...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: '#6B6F80' }}>No data available. Please start again.</p>
          <a href="/input" className="btn-gold inline-block mt-4">Start Again</a>
        </div>
      </div>
    );
  }

  const { bazi } = data;

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '6vh', paddingBottom: '8vh' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cosmic Blueprint
          </h1>
          <p className="text-xs mt-1" style={{ color: '#434759' }}>
            A preview of what the stars have revealed about you
          </p>
        </div>

        {/* FREE PREVIEW: Four Pillars Chart */}
        <div className="card-glass mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Your Four Pillars
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>Free Preview</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const p = bazi.pillars[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="text-center p-3 rounded"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[10px] uppercase mb-1.5" style={{ color: '#434759' }}>{pillar}</div>
                  <div className="font-bold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#C9A84C' }}>{p.animal}</div>
                  <div className="text-[10px]" style={{ color: '#434759' }}>{p.branchEn}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FREE PREVIEW: Soul Element (just the name) */}
        <div className="card-glass mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#434759' }}>Your Soul Element</div>
          <div className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {bazi.dayMaster.archetype}
          </div>
          <div className="text-xs mt-1" style={{ color: '#6B6F80' }}>
            {bazi.dayMaster.element} &mdash; {bazi.dayMaster.keywords}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="divider my-8"></div>

        {/* LOCKED CONTENT INDICATOR */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Unlock Your Complete Destiny Report
          </h2>
          <p className="text-xs" style={{ color: '#434759', lineHeight: '1.6' }}>
            Your free preview shows your core Four Pillars. The full report reveals your complete 
            energy balance, 15-year forecast, hidden influences, and personalized life guidance.
          </p>
        </div>

        {/* LOCKED PREVIEW (blurred mock) */}
        <div className="relative mb-8" style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
          {/* Five Elements (locked) */}
          <div className="card-glass mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#434759' }}>Cosmic Energy Distribution</div>
            {['Wood', 'Fire', 'Earth', 'Metal', 'Water'].map((elem) => (
              <div key={elem} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span style={{ color: '#6B6F80' }}>{elem}</span>
                  <span style={{ color: '#434759' }}>--%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="h-full rounded-full" style={{ width: '30%', background: 'rgba(201,168,76,0.3)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Personality (locked) */}
          <div className="card-glass mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#434759' }}>Personality Insight</div>
            <div className="text-xs leading-relaxed" style={{ color: '#434759', lineHeight: '1.7' }}>
              Your complete personality analysis, hidden influences, energy forecast, and life guidance are available in the full report...
            </div>
          </div>
        </div>

        {/* LOCK OVERLAY MESSAGE */}
        <div className="text-center mb-8" style={{ marginTop: '-1rem' }}>
          <div className="text-xs" style={{ color: '#434759' }}>
            <span className="inline-block text-lg" style={{ color: '#C9A84C' }}>✦</span> Full content hidden &mdash; choose your edition below
          </div>
        </div>

        {/* PRICING: Two Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {/* Standard ($49) */}
          <div className="card-glass p-6 flex flex-col">
            <h3 className="text-base font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Standard</h3>
            <div className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>$49</div>
            <ul className="text-xs space-y-1.5 mb-5 flex-1" style={{ color: '#6B6F80' }}>
              <li>15-page personalized report</li>
              <li>Day Master deep analysis</li>
              <li>Five Elements energy chart</li>
              <li>3-year energy forecast</li>
              <li>Personal affirmations</li>
            </ul>
            <button onClick={() => handlePurchase('standard')} disabled={purchaseLoading !== null} className="btn-gold w-full text-sm py-3">
              {purchaseLoading === 'standard' ? 'Redirecting...' : 'Unlock Standard'}
            </button>
          </div>

          {/* Grand Master ($99) */}
          <div className="card-glass card-premium p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>Best Value</div>
            <h3 className="text-base font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>Grand Master</h3>
            <div className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>$99</div>
            <ul className="text-xs space-y-1.5 mb-5 flex-1" style={{ color: '#6B6F80' }}>
              <li>Everything in Standard, plus:</li>
              <li>10-year strategic roadmap</li>
              <li>Annual breakdown (2026-2036)</li>
              <li>Fortune &amp; feng shui guidance</li>
              <li>Premium PDF with custom design</li>
            </ul>
            <button onClick={() => handlePurchase('grandmaster')} disabled={purchaseLoading !== null} className="btn-gold w-full text-sm py-3">
              {purchaseLoading === 'grandmaster' ? 'Redirecting...' : 'Unlock Grand Master'}
            </button>
          </div>
        </div>

        {purchaseError && (
          <div className="text-center mb-8">
            <p className="text-xs" style={{ color: 'rgba(255,80,80,0.8)' }}>{purchaseError}</p>
          </div>
        )}
      </div>
    </div>
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
