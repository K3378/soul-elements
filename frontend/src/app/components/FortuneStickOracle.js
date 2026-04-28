'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const ELEMENT_COLORS = {
  Wood: '#27AE60',
  Fire: '#E74C3C',
  Earth: '#F39C12',
  Metal: '#3498DB',
  Water: '#2C3E50',
};

const FORTUNE_LABELS = {
  'upper': { label: 'Great Fortune', color: '#58B86B' },
  'upper-middle': { label: 'Good Fortune', color: '#8BC34A' },
  'middle': { label: 'Steady Fortune', color: '#D4A54A' },
  'lower-middle': { label: 'Challenging', color: '#E67E22' },
  'lower': { label: 'Difficult Path', color: '#E05858' },
};

export default function FortuneStickOracle() {
  const [sticks, setSticks] = useState([]);
  const [currentStick, setCurrentStick] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const shakeCount = useRef(0);

  useEffect(() => {
    fetch('/data/sixtySticks.json')
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then(d => setSticks(d))
      .catch(e => setError('Oracle data unavailable'));
  }, []);

  const drawStick = useCallback(() => {
    if (shaking || sticks.length === 0) return;
    setShaking(true);
    setShowResult(false);
    shakeCount.current = 0;

    // Animated shaking sequence
    const shakeInterval = setInterval(() => {
      shakeCount.current++;
      if (shakeCount.current >= 8) {
        clearInterval(shakeInterval);
        // Pick a random stick
        const idx = Math.floor(Math.random() * sticks.length);
        const stick = sticks[idx];
        setCurrentStick(stick);
        setShaking(false);
        setShowResult(true);
        setHasDrawn(true);
        setHistory(prev => {
          const next = [stick, ...prev];
          return next.slice(0, 10); // Keep last 10
        });
      }
    }, 120);
  }, [shaking, sticks]);

  // Reset daily at midnight
  useEffect(() => {
    const lastDraw = getLastDraw();
    const today = new Date().toDateString();
    if (lastDraw !== today) {
      setHasDrawn(false);
    }
  }, []);

  const getLastDraw = () => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('soul_oracle_last'); } catch { return null; }
  };

  const setLastDraw = () => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('soul_oracle_last', new Date().toDateString()); } catch {}
  };

  const canDrawToday = () => {
    const lastDraw = getLastDraw();
    const today = new Date().toDateString();
    return lastDraw !== today;
  };

  const handleDraw = () => {
    if (!canDrawToday()) return;
    drawStick();
    setLastDraw();
  };

  return (
    <div className="w-full max-w-4xl mb-16" ref={containerRef}>
      <h2 className="text-2xl font-bold text-center mb-3" style={{ color: '#E6EDF3', fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}>
        The <span style={{ color: '#D4A54A' }}>Oracle</span> of Sixty
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: '#8B949E', maxWidth: '500px', margin: '0 auto 24px auto' }}>
        Shake the cylinder and draw a single fortune stick. One reading per day — ancient temple tradition.
      </p>

      <div style={{
        background: 'rgba(13,17,23,0.8)',
        border: '1px solid #21262D',
        borderRadius: '15px',
        padding: '40px 36px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}>
        {/* Oracle Cylinder */}
        <div style={{ position: 'relative', width: '160px', height: '200px', margin: '0 auto 24px auto', cursor: canDrawToday() && !shaking ? 'pointer' : 'default' }}
          onClick={canDrawToday() && !shaking ? handleDraw : undefined}>

          {/* Cylinder body */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '160px', height: '180px',
            background: 'linear-gradient(180deg, rgba(52,152,219,0.15), rgba(52,152,219,0.05))',
            border: '1px solid rgba(52,152,219,0.2)',
            borderRadius: '10px 10px 6px 6px',
            overflow: 'hidden',
          }}>
            {/* Decorative rings */}
            <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '1px', background: 'rgba(52,152,219,0.15)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(52,152,219,0.15)' }} />
            <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', background: 'rgba(52,152,219,0.15)' }} />
            {/* Sticks showing from top */}
            <div className={shaking ? 'animate-shake' : ''} style={{ position: 'absolute', top: '-15px', left: '15%', right: '15%' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  width: '4px', height: `${50 + Math.random() * 35}px`,
                  background: `linear-gradient(to bottom, ${['#D4A54A','#C49B3E','#B8922C','#A8851A','#D4A54A','#C49B3E','#B8922C','#A8851A','#D4A54A','#C49B3E','#B8922C','#A8851A'][i]}, #8B6F10)`,
                  position: 'absolute',
                  left: `${5 + i * 7}%`,
                  bottom: `${Math.random() * 15}px`,
                  transform: `rotate(${(Math.random() - 0.5) * 15}deg)`,
                  transformOrigin: 'bottom center',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8,
                }} />
              ))}
            </div>
          </div>

          {/* Base */}
          <div style={{
            position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
            width: '170px', height: '12px',
            background: 'rgba(52,152,219,0.1)',
            border: '1px solid rgba(52,152,219,0.2)',
            borderRadius: '50%',
          }} />

          {/* Click to draw overlay */}
          {canDrawToday() && !shaking && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              color: '#D4A54A', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.03em', zIndex: 2,
              opacity: hasDrawn ? 0 : 1,
              transition: 'opacity 0.3s',
            }}>
              {hasDrawn ? '' : 'Tap to Draw'}
            </div>
          )}

          {/* Already drawn today */}
          {!canDrawToday() && !shaking && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              color: '#6B6F80', fontSize: '11px', fontWeight: 500,
              textAlign: 'center', zIndex: 2,
            }}>
              Come back<br />tomorrow
            </div>
          )}
        </div>

        {/* Shaking animation indicator */}
        {shaking && (
          <div style={{ marginBottom: '16px' }}>
            <div className="animate-shake inline-block" style={{ fontSize: '28px' }}>🥢</div>
            <p className="text-xs mt-2" style={{ color: '#D4A54A' }}>The oracle stirs...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-xs" style={{ color: '#E05858' }}>{error}</p>
        )}

        {/* Result */}
        {showResult && currentStick && (
          <div className="animate-fadeIn">
            {/* Fortune badge */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                display: 'inline-block',
                background: `rgba(${FORTUNE_LABELS[currentStick.fortune].color === '#58B86B' ? '88,184,107' : FORTUNE_LABELS[currentStick.fortune].color === '#8BC34A' ? '139,195,74' : FORTUNE_LABELS[currentStick.fortune].color === '#D4A54A' ? '212,165,74' : FORTUNE_LABELS[currentStick.fortune].color === '#E67E22' ? '230,126,34' : '224,88,88'}, 0.15)`,
                border: `1px solid ${FORTUNE_LABELS[currentStick.fortune].color}`,
                borderRadius: '20px',
                padding: '4px 16px',
                fontSize: '11px',
                fontWeight: 600,
                color: FORTUNE_LABELS[currentStick.fortune].color,
                letterSpacing: '0.05em',
              }}>
                #{currentStick.id} — {FORTUNE_LABELS[currentStick.fortune].label}
              </span>
            </div>

            {/* Stem-Branch glyph */}
            <div style={{
              width: '120px', height: '120px',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(212,165,74,0.2)',
              borderRadius: '50%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(212,165,74,0.03)',
            }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#D4A54A', letterSpacing: '0.1em', fontFamily: "'Noto Serif SC', serif" }}>
                {currentStick.stemBranch}
              </div>
              <div style={{ fontSize: '9px', color: '#6B6F80', marginTop: '4px', letterSpacing: '0.03em' }}>
                {currentStick.pinyin}
              </div>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold mb-2" style={{ color: '#E6EDF3' }}>
              {currentStick.name}
            </h3>

            {/* Element + Animal tags */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span style={{
                background: `${ELEMENT_COLORS[currentStick.element]}15`,
                color: ELEMENT_COLORS[currentStick.element],
                border: `1px solid ${ELEMENT_COLORS[currentStick.element]}30`,
                borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 600,
              }}>
                {currentStick.yinYang === 'yang' ? '☀' : '☾'} {currentStick.element}
              </span>
              <span style={{
                background: 'rgba(212,165,74,0.08)',
                color: '#D4A54A',
                border: '1px solid rgba(212,165,74,0.15)',
                borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 600,
              }}>
                {currentStick.branchAnimal}
              </span>
            </div>

            {/* Divider */}
            <div style={{
              width: '60px', height: '1px',
              margin: '0 auto 20px auto',
              background: 'linear-gradient(90deg, transparent, rgba(212,165,74,0.3), transparent)',
            }} />

            {/* Poem */}
            <div style={{
              maxWidth: '380px', margin: '0 auto 20px auto',
              padding: '16px 20px',
              background: 'rgba(212,165,74,0.03)',
              border: '1px solid rgba(212,165,74,0.08)',
              borderRadius: '8px',
            }}>
              {currentStick.poem.split('\n').map((line, i) => (
                <p key={i} className="text-sm italic mb-1" style={{ color: '#C9D1D9', lineHeight: '1.6', fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}>
                  {line}
                </p>
              ))}
            </div>

            {/* Interpretation */}
            <div style={{
              maxWidth: '400px', margin: '0 auto',
            }}>
              <p className="text-xs leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                {currentStick.interpretation}
              </p>
            </div>

            {/* Draw again button (hidden if already drawn today) */}
            {canDrawToday() && (
              <button onClick={handleDraw} disabled={shaking}
                style={{
                  marginTop: '20px',
                  background: 'rgba(212,165,74,0.08)',
                  border: '1px solid rgba(212,165,74,0.2)',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  color: '#D4A54A',
                  cursor: shaking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                Draw Again
              </button>
            )}
          </div>
        )}

        {/* History toggle */}
        {history.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid #21262D', paddingTop: '16px' }}>
            <button onClick={() => setShowHistory(!showHistory)}
              style={{
                background: 'none', border: 'none',
                fontSize: '11px', color: '#6B6F80', cursor: 'pointer',
              }}>
              {showHistory ? 'Hide History' : `Show History (${history.length})`}
            </button>
            {showHistory && (
              <div style={{ marginTop: '12px' }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: 'inline-block',
                    margin: '4px',
                    padding: '4px 10px',
                    background: 'rgba(212,165,74,0.05)',
                    border: '1px solid rgba(212,165,74,0.1)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#8B949E',
                    cursor: 'pointer',
                  }}
                  onClick={() => { setCurrentStick(h); setShowResult(true); }}>
                    #{h.id} {h.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-3px) rotate(-2deg); }
          20% { transform: translateX(3px) rotate(2deg); }
          30% { transform: translateX(-3px) rotate(-1deg); }
          40% { transform: translateX(2px) rotate(1deg); }
          50% { transform: translateX(-2px) rotate(-2deg); }
          60% { transform: translateX(2px) rotate(1deg); }
          70% { transform: translateX(-1px) rotate(-1deg); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(-1px); }
        }
        .animate-shake { animation: shake 0.12s linear infinite; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}
