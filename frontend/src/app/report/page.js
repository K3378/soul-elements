'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ElementRadarChart from '../components/ElementRadarChart';

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
        const parsed = JSON.parse(stored);
        // Generate report content via backend
        fetch('/api/report/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bazi: parsed.bazi, goal: 'all', tier }),
        })
        .then(r => r.json())
        .then(result => {
          if (result.success) {
            setData(result.data);
          } else {
            setData({ bazi: parsed.bazi, report: null });
          }
          setLoading(false);
        })
        .catch(() => {
          setData({ bazi: parsed.bazi, report: null });
          setLoading(false);
        });
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
        const res = await fetch(`/api/report/${encodeURIComponent(sessionId)}?tier=${tier}`);
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
  }, [sessionId, tier]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Show loading state
      const btn = document.getElementById('pdf-download-btn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generating PDF...';
      }

      let pdfBlob;

      if (isTest || (!sessionId && bazi)) {
        // Direct PDF generation for test mode
        const res = await fetch('/api/report/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bazi, goal: 'all', tier }),
        });
        if (!res.ok) throw new Error('PDF generation failed');
        pdfBlob = await res.blob();
      } else if (sessionId) {
        // Session-based PDF download
        const res = await fetch(`/api/report/${encodeURIComponent(sessionId)}/pdf?tier=${tier}`);
        if (!res.ok) throw new Error('PDF generation failed');
        pdfBlob = await res.blob();
      } else {
        throw new Error('No data available');
      }

      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soul-elements-destiny-audit-${tier}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Failed to generate PDF. Please try again or use browser print.');
    } finally {
      const btn = document.getElementById('pdf-download-btn');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Download PDF Report';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="spinner mb-4"></div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Reading Your Cosmic Map...
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your personalized destiny report is being prepared.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Unable to load report.'}</p>
        <a href="/input" className="btn-gold inline-block mt-6">Start a New Reading</a>
      </div>
    );
  }

  const { bazi, report } = data;
  const isGrandmaster = tier === 'grandmaster';
  const percentages = bazi?.fullElements?.percentages || bazi?.fiveElements?.percentages || {};
  const hStems = bazi?.hiddenStems || {};
  const tenD = bazi?.tenDeities || {};
  const daYunData = bazi?.daYun || {};
  const branchData = bazi?.branchInteractions || [];
  const forecasts = bazi?.annualForecasts || [];
  const dm = bazi?.dayMaster || {};

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '4vh', paddingBottom: '4vh' }}>
      <div className="w-full max-w-4xl">
        {/* Print Header */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1>Soul Elements</h1>
          <div className="subtitle">Your Complete Destiny Report</div>
          <div className="edition">{isGrandmaster ? 'Grand Master Edition' : 'Standard Edition'}</div>
        </div>

        {/* Print Footer */}
        <div className="print-footer" style={{ display: 'none' }}>
          Soul Elements &mdash; Personalized Destiny Report &mdash; Page 1
        </div>

        {/* Download Bar */}
        <div className="text-right mb-6 print:hidden">
          <button id="pdf-download-btn" onClick={handleDownloadPDF} className="btn-gold text-sm px-6 py-2" style={{ minWidth: '200px' }}>
            Download PDF Report
          </button>
        </div>

        {/* === 1. SOUL ELEMENT === */}
        <div className="card-glass mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Your Soul Element</div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {dm.archetype || 'Your Unique Self'}
          </h1>
          <div className="text-sm mb-4" style={{ color: 'var(--gold)' }}>
            {dm.element || ''} &mdash; {dm.keywords || ''} &mdash; {dm.polarity || ''}
          </div>

          {report?.personality && (
            <>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                {report.personality.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded" style={{ background: 'rgba(212,165,74,0.04)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Strengths</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.personality.strengths}</p>
                </div>
                <div className="p-3.5 rounded" style={{ background: 'rgba(100,100,120,0.04)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Growth Areas</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.personality.weaknesses}</p>
                </div>
              </div>
              {isGrandmaster && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3.5 rounded" style={{ background: 'rgba(100,100,120,0.04)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Communication Style</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.personality.communication}</p>
                  </div>
                  <div className="p-3.5 rounded" style={{ background: 'rgba(212,165,74,0.04)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Core Challenge</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.personality.challenges}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* === 2. FOUR PILLARS === */}
        <div className="card-glass mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
            Your Four Pillars
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const p = bazi?.pillars?.[pillar];
              if (!p) return null;
              const td = tenD?.[pillar];
              return (
                <div key={pillar} className="p-3.5 rounded text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[10px] uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>{pillar} Pillar</div>
                  <div className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{p.stemElement}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>{p.stemEn || ''}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {p.animal} ({p.branchEn})
                  </div>
                  {td && (
                    <div className="text-[10px] mt-1.5 px-2 py-1 rounded" style={{ background: 'rgba(212,165,74,0.06)', color: 'var(--gold)' }}>
                      {td.tenGodEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {bazi?.trueSolarTime?.note && (
            <p className="text-[10px] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              {bazi.trueSolarTime.note}
            </p>
          )}
        </div>

        {/* === 3. TEN DEITIES ANALYSIS === */}
        {report?.tenDeities && report.tenDeities.deities && report.tenDeities.deities.length > 0 && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Ten Deities &mdash; Your Energetic Roles
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {report.tenDeities.intro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.tenDeities.deities.filter(d => d.position !== 'day').map(d => (
                <div key={d.position} className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>{d.position}</span>
                    <span className="text-xs" style={{ color: d.polarity === 'Yang' ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {d.stem} ({d.element})
                    </span>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{d.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.psychology}</div>
                  <div className="text-[10px] mt-1 italic" style={{ color: 'var(--text-dim)' }}>
                    Influences: {d.pillarMeaning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === 4. FIVE ELEMENTS === */}
        <div className="card-glass mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
            Cosmic Energy Balance
          </h2>

          {Object.keys(percentages).length > 0 && (
            <>
              {/* Radar Chart */}
              <div className="flex justify-center mb-6">
                <ElementRadarChart percentages={percentages} size={280} />
              </div>

              {/* Full element breakdown */}
              <div className="mb-4">
                {Object.entries(percentages).sort((a, b) => b[1] - a[1]).map(([elem, pct]) => {
                  const elemKeys = { 'Wood': '🌲', 'Fire': '🔥', 'Earth': '🌍', 'Metal': '⚔️', 'Water': '🌊' };
                  return (
                    <div key={elem} className="mb-3">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span style={{ fontFamily: "'Playfair Display', serif" }}>
                          {elemKeys[elem] || ''} {elem}
                        </span>
                        <span style={{ color: 'var(--gold)' }}>{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full" style={{ 
                          width: `${pct}%`, 
                          background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' 
                        }} />
                      </div>
                      {report?.elementAnalysis?.details?.[elem] && (
                        <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{report.elementAnalysis.details[elem]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Full element detail (Grand Master only) */}
              {isGrandmaster && report?.elementAnalysis?.fullElementDetails && (
                <div className="mt-6 p-3.5 rounded" style={{ background: 'rgba(212,165,74,0.03)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>Advanced Element Analysis (with Hidden Stems)</h3>
                  {report.elementAnalysis.fullElementDetails.map(d => (
                    <div key={d.element} className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <strong>{d.element} ({d.percentage}%):</strong> {d.insight}
                    </div>
                  ))}
                </div>
              )}

              {report?.fiveElementsInsight && (
                <div className="p-3.5 rounded text-xs leading-relaxed mt-4" style={{ background: 'rgba(212,165,74,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  <strong style={{ color: 'var(--gold)' }}>Balance Insight:</strong> {report.fiveElementsInsight}
                </div>
              )}
            </>
          )}
        </div>

        {/* === 5. HIDDEN STEMS === */}
        {report?.hiddenStemsGuidance && report.hiddenStemsGuidance.positions && report.hiddenStemsGuidance.positions.length > 0 && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Hidden Stems &mdash; Your Subconscious Energies
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {report.hiddenStemsGuidance.intro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.hiddenStemsGuidance.positions.map(hs => (
                <div key={hs.position} className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>{hs.positionTitle}</div>
                  <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                    {hs.animal} ({hs.branch}) branch
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {hs.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === 6. BRANCH INTERACTIONS === */}
        {report?.branchInteractions && report.branchInteractions.interactions && report.branchInteractions.interactions.length > 0 && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Branch Interactions &mdash; The Energy Dynamics
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {report.branchInteractions.intro}
            </p>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {report.branchInteractions.interactions.map((int, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--gold)', minWidth: '100px' }}>{int.type}</span>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{int.branches}</div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{int.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === 7. LIFE GUIDANCE === */}
        {report?.lifeGuidance && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              {report.lifeGuidance.section}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {report.lifeGuidance.guidance}
            </p>

            {/* Career/Love/Inner detailed paths (Grand Master only) */}
            {isGrandmaster && (
              <div className="mt-4">
                {report.lifeGuidance.careerPath && (
                  <div className="p-3 rounded mb-3" style={{ background: 'rgba(212,165,74,0.03)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Professional Path</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.lifeGuidance.careerPath}</p>
                  </div>
                )}
                {report.lifeGuidance.lovePath && (
                  <div className="p-3 rounded mb-3" style={{ background: 'rgba(100,100,120,0.03)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Relationship Blueprint</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.lifeGuidance.lovePath}</p>
                  </div>
                )}
                {report.lifeGuidance.innerPath && (
                  <div className="p-3 rounded" style={{ background: 'rgba(212,165,74,0.03)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Inner Evolution</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.lifeGuidance.innerPath}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lucky Directions: </span>
                <span style={{ color: 'var(--gold)' }}>{report.lifeGuidance.luckyDirections}</span>
              </div>
              <div className="p-2.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lucky Colors: </span>
                <span style={{ color: 'var(--gold)' }}>{report.lifeGuidance.luckyColors}</span>
              </div>
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {report.lifeGuidance.advice}
            </p>
          </div>
        )}

        {/* === 8. DA YUN (LUCK CYCLES) === */}
        {report?.daYun && report.daYun.pillars && report.daYun.pillars.length > 0 && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Luck Cycles &mdash; Your 10-Year Chapters
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {report.daYun.intro}
            </p>
            {!isGrandmaster && (
              <div className="p-3 rounded text-xs mb-4 text-center" style={{ background: 'rgba(212,165,74,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Full Luck Cycle analysis with detailed yearly breakdown is available in the Grand Master Edition.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Cycle</th>
                    <th className="text-left p-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Age</th>
                    <th className="text-left p-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Years</th>
                    <th className="text-left p-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Element</th>
                    <th className="text-left p-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Animal</th>
                  </tr>
                </thead>
                <tbody>
                  {report.daYun.pillars.map(p => (
                    <tr key={p.pillar}>
                      <td className="p-2" style={{ color: 'var(--gold)' }}>{p.pillar}</td>
                      <td className="p-2" style={{ color: 'var(--text-secondary)' }}>{p.ageRange}</td>
                      <td className="p-2" style={{ color: 'var(--text-muted)' }}>{p.yearRange}</td>
                      <td className="p-2" style={{ color: 'var(--gold)' }}>{p.stemElement}</td>
                      <td className="p-2" style={{ color: 'var(--text-secondary)' }}>{p.animal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === 9. ANNUAL FORECAST === */}
        {report?.annualForecast && report.annualForecast.years && report.annualForecast.years.length > 0 && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Annual Energy Forecast
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {report.annualForecast.intro}
            </p>
            {!isGrandmaster && (
              <div className="p-3 rounded text-xs mb-4" style={{ background: 'rgba(212,165,74,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {report.energyForecast.summary}
              </div>
            )}
            {isGrandmaster && (
              <div className="divide-y max-h-[500px] overflow-y-auto custom-scroll" style={{ borderColor: 'var(--border)' }}>
                {report.annualForecast.years.map((yf, i) => (
                  <div key={i} className="py-4 first:pt-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>{yf.year}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{yf.stem} {yf.animal} ({yf.element})</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{yf.relationship}</p>
                    {yf.branchInteractions && yf.branchInteractions.length > 0 && (
                      <div className="mt-2">
                        {yf.branchInteractions.map((bi, j) => (
                          <div key={j} className="text-[10px] px-2 py-1 inline-block mr-1 mb-1 rounded" style={{ background: 'rgba(212,165,74,0.04)', color: 'var(--text-muted)' }}>
                            {bi}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === 10. ENERGY FORECAST === */}
        {report?.energyForecast && !isGrandmaster && (
          <div className="card-glass mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Energy Forecast
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {report.energyForecast.summary}
            </p>
            {report.energyForecast.detailed && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {report.energyForecast.detailed}
              </p>
            )}
          </div>
        )}

        {/* === 11. PERSONAL AFFIRMATION === */}
        {report?.personalAffirmation && (
          <div className="card-glass mb-6 text-center">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
              Your Personal Affirmation
            </h2>
            <p className="text-base italic leading-relaxed" style={{ color: 'var(--gold)', lineHeight: '1.8', opacity: 0.9 }}>
              &ldquo;{report.personalAffirmation}&rdquo;
            </p>
          </div>
        )}

        {/* Report Edition badge */}
        <div className="text-center mb-6">
          <div className="inline-block text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest" style={{ background: 'rgba(212,165,74,0.06)', border: '1px solid var(--border)', color: 'var(--gold)' }}>
            {report?.pageCount || (isGrandmaster ? 'Grand Master Edition' : 'Standard Edition')}
          </div>
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
