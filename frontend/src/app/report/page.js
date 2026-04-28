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
    if (isTest) {
      const stored = sessionStorage.getItem('test_report');
      if (stored) {
        setData(JSON.parse(stored));
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

  const handlePrint = () => {
    window.print();
  };

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

  const { bazi, report } = data;
  const isGrandmaster = tier === 'grandmaster';
  const percentages = bazi?.fiveElements?.percentages || {};
  const dominant = report?.elementAnalysis?.dominant || '';
  const dm = bazi?.dayMaster || {};

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '4vh', paddingBottom: '4vh' }}>
      <div className="w-full max-w-4xl">
        {/* Print Header - hidden on screen */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Soul Elements</h1>
          <p className="text-sm" style={{ color: '#6B6F80' }}>Your Complete Destiny Report</p>
          <p className="text-xs mt-1" style={{ color: '#434759' }}>{isGrandmaster ? 'Grand Master Edition' : 'Standard Edition'}</p>
        </div>

        {/* Download Bar */}
        <div className="text-right mb-6 print:hidden">
          <button onClick={handlePrint} className="btn-gold text-sm px-6 py-2">
            Download PDF Report
          </button>
        </div>

        {/* 1. Soul Element */}
        <div className="card-glass mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#434759' }}>Your Soul Element</div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {dm.archetype || 'Your Unique Self'}
          </h1>
          <div className="text-sm mb-4" style={{ color: '#C9A84C' }}>
            {dm.element || ''} &mdash; {dm.keywords || ''}
          </div>

          {report?.personality && (
            <>
              <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
                {report.personality.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded" style={{ background: 'rgba(201,168,76,0.05)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>Strengths</div>
                  <p className="text-xs" style={{ color: '#6B6F80' }}>{report.personality.strengths}</p>
                </div>
                <div className="p-3 rounded" style={{ background: 'rgba(100,100,120,0.05)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>Growth Areas</div>
                  <p className="text-xs" style={{ color: '#6B6F80' }}>{report.personality.weaknesses}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Four Pillars */}
        <div className="card-glass mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Your Four Pillars
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const p = bazi?.pillars?.[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="p-3 rounded text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[10px] uppercase mb-1.5" style={{ color: '#434759' }}>{pillar} Pillar</div>
                  <div className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#C9A84C' }}>
                    {p.stemEn || ''}
                  </div>
                  <div className="text-xs" style={{ color: '#6B6F80', marginTop: 2 }}>
                    {p.animal} ({p.branchEn})
                  </div>
                </div>
              );
            })}
          </div>
          {bazi?.trueSolarTime?.note && (
            <p className="text-[10px] mt-3 text-center" style={{ color: '#434759' }}>
              {bazi.trueSolarTime.note}
            </p>
          )}
        </div>

        {/* 3. Five Elements */}
        <div className="card-glass mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
            Cosmic Energy Balance
          </h2>

          {Object.keys(percentages).length > 0 && (
            <>
              <div className="mb-4">
                {Object.entries(percentages).map(([elem, pct]) => (
                  <div key={elem} className="mb-3">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span style={{ fontFamily: "'Playfair Display', serif" }}>{elem}</span>
                      <span style={{ color: '#C9A84C' }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8D48B)' }} />
                    </div>
                    {report?.elementAnalysis?.details?.[elem] && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#434759' }}>{report.elementAnalysis.details[elem]}</p>
                    )}
                  </div>
                ))}
              </div>

              {report?.elementAnalysis?.dominant && (
                <div className="p-3 rounded text-xs leading-relaxed" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', color: '#6B6F80', lineHeight: '1.7' }}>
                  <strong style={{ color: '#C9A84C' }}>Balance Insight:</strong> {report.fiveElementsInsight}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Life Guidance */}
        {report?.lifeGuidance && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              {report.lifeGuidance.section}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
              {report.lifeGuidance.guidance}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2 rounded text-xs" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: '#434759' }}>Lucky Directions: </span>
                <span style={{ color: '#C9A84C' }}>{report.lifeGuidance.luckyDirections}</span>
              </div>
              <div className="p-2 rounded text-xs" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: '#434759' }}>Lucky Colors: </span>
                <span style={{ color: '#C9A84C' }}>{report.lifeGuidance.luckyColors}</span>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#434759', lineHeight: '1.6' }}>
              {report.lifeGuidance.advice}
            </p>
          </div>
        )}

        {/* 5. Energy Forecast */}
        {report?.energyForecast && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Energy Forecast
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
              {report.energyForecast.summary}
            </p>
          </div>
        )}

        {/* 6. Hidden Influences */}
        {report?.hiddenStemsGuidance && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Hidden Influences
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {report.hiddenStemsGuidance}
            </p>
          </div>
        )}

        {/* 7. Personal Affirmation */}
        {report?.personalAffirmation && (
          <div className="card-glass mb-6 text-center">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Your Personal Affirmation
            </h2>
            <p className="text-base italic leading-relaxed" style={{ color: '#C9A84C', lineHeight: '1.8', opacity: 0.9 }}>
              &ldquo;{report.personalAffirmation}&rdquo;
            </p>
          </div>
        )}

        {/* Grand Master extras */}
        {isGrandmaster && (
          <div className="card-glass card-premium mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Grand Master Insights
            </h2>
            {report?.energyForecast?.detailed && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2" style={{ color: '#6B6F80' }}>10-Year Strategic Outlook</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
                  {report.energyForecast.detailed}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Download */}
        <div className="text-center mt-10 mb-12 print:hidden">
          <button onClick={handlePrint} className="btn-gold px-10 py-4">
            Download Full PDF Report
          </button>
          <p className="text-xs mt-3" style={{ color: '#434759' }}>
            Your report is always available for viewing.
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
