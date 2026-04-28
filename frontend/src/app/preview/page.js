'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  useEffect(() => {
    if (key) {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
        setLoading(false);
      } else {
        // If no sessionStorage (e.g. direct link), try legacy URL param
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
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reportData: data?.bazi }),
      });
      const result = await res.json();
      if (result.url) window.location.href = result.url;
      else throw new Error(result.error || 'Checkout failed');
    } catch (err) {
      alert('Payment failed. Please try again.');
      setPurchaseLoading(null);
    }
  };

  if (!data) {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="tai-chi-spin mb-4">
            <svg width="60" height="60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
              <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
              <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
              <circle cx="50" cy="26" r="8" fill="#C9A84C" />
            </svg>
          </div>
          <p style={{ color: '#8B8FA3' }}>Loading your reading...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#8B8FA3' }}>No data available. Please start again.</p>
      </div>
    );
  }

  const { bazi, preview } = data;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 fade-in-up">
          <div className="tai-chi-spin mb-4">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
              <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
              <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
              <circle cx="50" cy="26" r="8" fill="#C9A84C" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cosmic Blueprint
          </h1>
          <p className="text-sm mt-2" style={{ color: '#8B8FA3' }}>
            Here is a preview of what the universe has revealed about you.
          </p>
        </div>

        {/* BaZi Chart */}
        <div className="card-glass mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Four Pillars
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar, i) => {
              const p = bazi.pillars[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="text-center p-3 rounded-lg"
                     style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xs uppercase mb-2" style={{ color: '#8B8FA3' }}>{pillar}</div>
                  <div className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-xs" style={{ color: '#C9A84C' }}>{p.animal} ({p.branchEn})</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Soul Element Preview */}
        <div className="card-glass mb-8 fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Soul Element
          </h2>
          <div className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {bazi.dayMaster.archetype}
          </div>
          <div className="text-sm mb-3" style={{ color: '#C9A84C' }}>{bazi.dayMaster.element} — {bazi.dayMaster.keywords}</div>
          <p className="text-sm leading-relaxed" style={{ color: '#8B8FA3' }}>
            {preview.soulElement}
          </p>
        </div>

        {/* Five Elements Preview */}
        <div className="card-glass mb-8 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Cosmic Energy Distribution
          </h2>
          {bazi.fiveElements.percentages && Object.entries(bazi.fiveElements.percentages).map(([elem, pct]) => (
            <div key={elem} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{elem}</span>
                <span style={{ color: '#C9A84C' }}>{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8D48B)' }} />
              </div>
            </div>
          ))}
          <p className="text-xs mt-3" style={{ color: '#8B8FA3' }}>{preview.energyHint}</p>
        </div>

        {/* Personality Preview */}
        <div className="card-glass mb-8 fade-in-up" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Personality Insight
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#8B8FA3' }}>
            {preview.personality.substring(0, 150)}...
          </p>
          <div className="text-xs mt-3 italic" style={{ color: '#C9A84C' }}>
            This is just a glimpse. The full 15-page report awaits you.
          </div>
        </div>

        {/* Accuracy Note */}
        {bazi.accuracyNote && (
          <div className="text-xs mb-8 text-center" style={{ color: '#8B8FA3' }}>
            {bazi.accuracyNote}
          </div>
        )}

        {/* CTA */}
        <div className="text-center fade-in-up mb-20" style={{ animationDelay: '1s' }}>
          <div className="card-glass mb-4">
            <h3 className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Unlock Your Complete Destiny Report
          </h3>
            <p className="text-sm mb-4" style={{ color: '#8B8FA3' }}>
              15 pages of personalized wisdom. Your true cosmic blueprint awaits.
            </p>
          <button onClick={() => handlePurchase('standard')} disabled={purchaseLoading !== null} className="btn-gold text-lg px-12 py-4 glow-gold">
              {purchaseLoading === 'standard' ? 'Redirecting...' : 'Unlock Full Report — $49'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="tai-chi-spin">
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
            <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
            <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
            <circle cx="50" cy="26" r="8" fill="#C9A84C" />
          </svg>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
