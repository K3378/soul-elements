'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
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
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reportData: data?.bazi }),
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

  const { bazi, preview } = data;

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '8vh', paddingBottom: '8vh' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cosmic Blueprint
          </h1>
          <p className="text-sm mt-2" style={{ color: '#6B6F80' }}>
            Here is a preview of what the universe has revealed about you.
          </p>
        </div>

        {/* BaZi Chart */}
        <div className="card-glass mb-8">
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Four Pillars
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar, i) => {
              const p = bazi.pillars[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="text-center p-3 rounded-lg"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs uppercase mb-2" style={{ color: '#6B6F80' }}>{pillar}</div>
                  <div className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-xs" style={{ color: '#C9A84C' }}>{p.animal} ({p.branchEn})</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Soul Element Preview */}
        <div className="card-glass mb-8">
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Soul Element
          </h2>
          <div className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {bazi.dayMaster.archetype}
          </div>
          <div className="text-sm mb-3" style={{ color: '#C9A84C' }}>{bazi.dayMaster.element} &mdash; {bazi.dayMaster.keywords}</div>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.7' }}>
            {preview.soulElement}
          </p>
        </div>

        {/* Five Elements Preview */}
        <div className="card-glass mb-8">
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Cosmic Energy Distribution
          </h2>
          {bazi.fiveElements.percentages && Object.entries(bazi.fiveElements.percentages).map(([elem, pct]) => (
            <div key={elem} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{elem}</span>
                <span style={{ color: '#C9A84C' }}>{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8D48B)' }} />
              </div>
            </div>
          ))}
          <p className="text-xs mt-3" style={{ color: '#6B6F80' }}>{preview.energyHint}</p>
        </div>

        {/* Personality Preview */}
        <div className="card-glass mb-8">
          <h2 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Personality Insight
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.7' }}>
            {preview.personality.substring(0, 150)}...
          </p>
          <p className="text-xs mt-3" style={{ color: '#C9A84C', opacity: 0.7 }}>
            This is just a glimpse. The full 15-page report awaits you.
          </p>
        </div>

        {/* Accuracy Note */}
        {bazi.accuracyNote && (
          <p className="text-xs mb-8 text-center" style={{ color: '#6B6F80' }}>
            {bazi.accuracyNote}
          </p>
        )}

        {/* CTA */}
        <div className="text-center mb-20">
          <div className="card-glass mb-4 p-8">
            <h3 className="text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Unlock Your Complete Destiny Report
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B6F80' }}>
              15 pages of personalized wisdom. Your true cosmic blueprint awaits.
            </p>
            <button onClick={() => handlePurchase('standard')} disabled={purchaseLoading !== null} className="btn-gold text-lg px-12 py-4">
              {purchaseLoading === 'standard' ? 'Redirecting...' : 'Unlock Full Report  $49'}
            </button>
            {purchaseError && (
              <p className="text-xs mt-3" style={{ color: 'rgba(255,80,80,0.8)' }}>{purchaseError}</p>
            )}
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
        <div className="spinner"></div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
