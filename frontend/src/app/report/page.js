'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function ReportContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier') || 'standard';
  const isTest = searchParams.get('test') === '1';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TEST MODE: read from sessionStorage
    if (isTest) {
      const stored = sessionStorage.getItem('test_report');
      if (stored) {
        setData({ bazi: JSON.parse(stored) });
        setLoading(false);
        return;
      }
    }

    if (!sessionId) {
      setError('No session ID found. Please access this page after completing payment.');
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(`/api/report/${encodeURIComponent(sessionId)}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Report data not found. It may have expired.');
        }
      } catch (err) {
        setError('Failed to load your report. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="spinner mb-4"></div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Reading Your Cosmic Map...
        </h1>
        <p className="text-sm" style={{ color: '#6B6F80' }}>
          Your personalized destiny report is being prepared.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p style={{ color: '#6B6F80' }}>{error || 'Unable to load report.'}</p>
        <a href="/input" className="btn-gold inline-block mt-6">Start a New Reading</a>
      </div>
    );
  }

  const { bazi } = data;
  const isGrandmaster = tier === 'grandmaster';

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '8vh', paddingBottom: '8vh' }}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Complete Destiny Report
          </h1>
          <p className="text-sm" style={{ color: '#6B6F80' }}>
            {isGrandmaster ? 'Grand Master Edition' : 'Standard Edition'}
          </p>
        </div>

        {/* Soul Element */}
        <div className="card-glass mb-6">
          <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Soul Element: {bazi.dayMaster.archetype}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
            As a <strong style={{ color: '#C9A84C' }}>{bazi.dayMaster.element}</strong> person, you embody the essence of{' '}
            <strong style={{ color: '#C9A84C' }}>{bazi.dayMaster.archetype}</strong> &mdash;{' '}
            {bazi.dayMaster.keywords}. Your presence commands respect, and your integrity is the foundation of everything you build.
          </p>
        </div>

        {/* Four Pillars */}
        <div className="card-glass mb-6">
          <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Four Pillars
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const p = bazi.pillars[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="p-4 rounded-lg text-center"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs uppercase mb-2" style={{ color: '#6B6F80' }}>{pillar} Pillar</div>
                  <div className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-xs mt-1" style={{ color: '#C9A84C' }}>
                    {p.stemChinese} &mdash; {p.stemEn}
                  </div>
                  <div className="text-xs" style={{ color: '#6B6F80', marginTop: 4 }}>
                    {p.branchChinese} ({p.branchEn})
                  </div>
                  <div className="text-xs" style={{ color: '#434759' }}>{p.animal}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Five Elements */}
        <div className="card-glass mb-6">
          <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Cosmic Energy Balance
          </h2>
          {bazi.fiveElements.percentages && Object.entries(bazi.fiveElements.percentages).map(([elem, pct]) => (
            <div key={elem} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ fontFamily: "'Playfair Display', serif" }}>{elem}</span>
                <span style={{ color: '#C9A84C' }}>{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8D48B)' }} />
              </div>
            </div>
          ))}
          {bazi.fiveElements.insight && (
            <p className="text-xs mt-4" style={{ color: '#6B6F80', lineHeight: '1.7' }}>
              {bazi.fiveElements.insight}
            </p>
          )}
        </div>

        {/* Hidden Stems */}
        {bazi.hiddenStems && (
          <div className="card-glass mb-6">
            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Hidden Influences
            </h2>
            {bazi.hiddenStems.map((hs, i) => (
              <div key={i} className="flex items-center gap-3 mb-3 text-sm">
                <span style={{ color: '#C9A84C', minWidth: 60 }}>{hs.branch}</span>
                <span style={{ color: '#6B6F80' }}>{hs.stems.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Energy Forecast */}
        {bazi.energyForecast && (
          <div className="card-glass mb-6">
            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Energy Forecast
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
              {bazi.energyForecast}
            </p>
          </div>
        )}

        {/* Download */}
        <div className="text-center mt-12 mb-20">
          <button className="btn-gold px-10 py-4">
            Download Full PDF Report
          </button>
          <p className="text-xs mt-3" style={{ color: '#434759' }}>
            Your report is available for viewing anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
