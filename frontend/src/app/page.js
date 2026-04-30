'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FortuneStickOracle = dynamic(() => import('./components/FortuneStickOracle'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const TZ_GROUPS = [
  { offset: -12, label: 'UTC-12', cities: 'Baker Island', examples: [{ name: 'Pacific/Kwajalein', label: 'Kwajalein' }] },
  { offset: -11, label: 'UTC-11', cities: 'American Samoa, Niue', examples: [{ name: 'Pacific/Pago_Pago', label: 'Pago Pago' }, { name: 'Pacific/Niue', label: 'Niue' }] },
  { offset: -10, label: 'UTC-10', cities: 'Hawaii, Tahiti', examples: [{ name: 'Pacific/Honolulu', label: 'Honolulu' }] },
  { offset: -9, label: 'UTC-9', cities: 'Alaska', examples: [{ name: 'America/Anchorage', label: 'Anchorage' }] },
  { offset: -8, label: 'UTC-8', cities: 'California, Vancouver', examples: [{ name: 'America/Los_Angeles', label: 'California' }, { name: 'America/Vancouver', label: 'Vancouver' }] },
  { offset: -7, label: 'UTC-7', cities: 'Denver, Phoenix', examples: [{ name: 'America/Denver', label: 'Denver' }] },
  { offset: -6, label: 'UTC-6', cities: 'Chicago, Mexico City, Dallas', examples: [{ name: 'America/Chicago', label: 'Chicago' }, { name: 'America/Mexico_City', label: 'Mexico City' }] },
  { offset: -5, label: 'UTC-5', cities: 'New York, Miami, Toronto', examples: [{ name: 'America/New_York', label: 'New York' }, { name: 'America/Toronto', label: 'Toronto' }] },
  { offset: -4, label: 'UTC-4', cities: 'Santiago, Caracas, Halifax', examples: [{ name: 'America/Santiago', label: 'Santiago' }] },
  { offset: -3, label: 'UTC-3', cities: 'Buenos Aires, So Paulo', examples: [{ name: 'America/Sao_Paulo', label: 'So Paulo' }, { name: 'America/Buenos_Aires', label: 'Buenos Aires' }] },
  { offset: 0, label: 'UTC0', cities: 'London, Lisbon, Reykjavik', examples: [{ name: 'Europe/London', label: 'London' }, { name: 'Europe/Lisbon', label: 'Lisbon' }, { name: 'Atlantic/Reykjavik', label: 'Reykjavik' }] },
  { offset: 1, label: 'UTC+1', cities: 'Paris, Berlin, Rome, Madrid', examples: [{ name: 'Europe/Paris', label: 'Paris' }, { name: 'Europe/Berlin', label: 'Berlin' }, { name: 'Europe/Rome', label: 'Rome' }] },
  { offset: 2, label: 'UTC+2', cities: 'Athens, Cairo, Jerusalem', examples: [{ name: 'Europe/Athens', label: 'Athens' }, { name: 'Africa/Cairo', label: 'Cairo' }] },
  { offset: 3, label: 'UTC+3', cities: 'Moscow, Riyadh, Nairobi', examples: [{ name: 'Europe/Moscow', label: 'Moscow' }, { name: 'Asia/Riyadh', label: 'Riyadh' }] },
  { offset: 3.5, label: 'UTC+3:30', cities: 'Tehran', examples: [{ name: 'Asia/Tehran', label: 'Tehran' }] },
  { offset: 4, label: 'UTC+4', cities: 'Dubai, Baku, Muscat', examples: [{ name: 'Asia/Dubai', label: 'Dubai' }] },
  { offset: 5.5, label: 'UTC+5:30', cities: 'India, Sri Lanka', examples: [{ name: 'Asia/Kolkata', label: 'Kolkata / Mumbai' }] },
  { offset: 6, label: 'UTC+6', cities: 'Dhaka, Almaty', examples: [{ name: 'Asia/Dhaka', label: 'Dhaka' }] },
  { offset: 7, label: 'UTC+7', cities: 'Bangkok, Hanoi, Jakarta', examples: [{ name: 'Asia/Bangkok', label: 'Bangkok' }, { name: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh' }, { name: 'Asia/Jakarta', label: 'Jakarta' }] },
  { offset: 8, label: 'UTC+8', cities: 'Hong Kong, Beijing, Taipei, Singapore, Perth', examples: [{ name: 'Asia/Hong_Kong', label: 'Hong Kong' }, { name: 'Asia/Shanghai', label: 'Beijing / Shanghai' }, { name: 'Asia/Taipei', label: 'Taipei' }, { name: 'Asia/Singapore', label: 'Singapore' }] },
  { offset: 9, label: 'UTC+9', cities: 'Tokyo, Seoul, Osaka', examples: [{ name: 'Asia/Tokyo', label: 'Tokyo' }, { name: 'Asia/Seoul', label: 'Seoul' }] },
  { offset: 10, label: 'UTC+10', cities: 'Sydney, Melbourne, Brisbane', examples: [{ name: 'Australia/Sydney', label: 'Sydney' }] },
  { offset: 12, label: 'UTC+12', cities: 'Auckland, Fiji', examples: [{ name: 'Pacific/Auckland', label: 'Auckland' }] },
];

// ===================== SCROLL ANIMATION HOOK =====================
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    // Immediately reveal everything so no sections are invisible
    const allVisible = {};
    targets.forEach(t => {
      allVisible[t.dataset.reveal] = true;
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
    });
    setVisible(allVisible);
    setReady(true);
    // Subtle entrance animation — unobtrusive opacity + translate for off-screen elements
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    targets.forEach(t => {
      const rect = t.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
      } else {
        t.style.opacity = '0.01';
        t.style.transform = 'translateY(15px)';
        obs.observe(t);
      }
    });
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ===================== FIVE ELEMENTS SVG CYCLE =====================
function FiveElementsCycle() {
  const elements = [
    { name: 'Wood', color: '#27AE60', angle: -90 },
    { name: 'Fire', color: '#E74C3C', angle: -18 },
    { name: 'Earth', color: '#F39C12', angle: 54 },
    { name: 'Metal', color: '#3B82F6', angle: 126 },
    { name: 'Water', color: '#2C3E50', angle: 198 },
  ];
  const cx = 120, cy = 120, r = 80, dotR = 22;

  const generatingPairs = [['Wood','Fire'],['Fire','Earth'],['Earth','Metal'],['Metal','Water'],['Water','Wood']];
  const controllingPairs = [['Fire','Metal'],['Metal','Wood'],['Wood','Earth'],['Earth','Water'],['Water','Fire']];

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: 'visible' }}>
        {/* Outer guiding ring */}
        <circle cx={cx} cy={cy} r={r + 28} fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Generating arrows (outer ring) */}
        {generatingPairs.map(([from, to]) => {
          const f = elements.find(e => e.name === from);
          const t = elements.find(e => e.name === to);
          const a1 = f.angle * Math.PI / 180;
          const a2 = t.angle * Math.PI / 180;
          const midAngle = (f.angle + t.angle) / 2;
          const midR = r + 18;
          const mx = cx + midR * Math.cos(midAngle * Math.PI / 180);
          const my = cy + midR * Math.sin(midAngle * Math.PI / 180);
          const gapAngle = (t.angle - f.angle + 360) % 360;
          const arcR = r + 18;
          const largeArc = gapAngle > 180 ? 1 : 0;
          const sx = cx + arcR * Math.cos(a1);
          const sy = cy + arcR * Math.sin(a1);
          const ex = cx + arcR * Math.cos(a2);
          const ey = cy + arcR * Math.sin(a2);
          const arrowAngle = a2 + Math.PI * (gapAngle > 180 ? -0.8 : 0.8);
          return (
            <g key={`gen-${from}-${to}`}>
              <path d={`M ${sx} ${sy} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ex} ${ey}`}
                fill="none" stroke={`${f.color}40`} strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={mx} y={my - 8} textAnchor="middle" fontSize="7" fill={`${f.color}70`} fontWeight={300}>
                feeds
              </text>
            </g>
          );
        })}

        {/* Controlling arrows (inner ring) */}
        {controllingPairs.map(([from, to]) => {
          const f = elements.find(e => e.name === from);
          const t = elements.find(e => e.name === to);
          const a1 = f.angle * Math.PI / 180;
          const a2 = t.angle * Math.PI / 180;
          const gapAngle = (t.angle - f.angle + 360) % 360;
          const arcR = r - 10;
          const largeArc = gapAngle > 180 ? 1 : 0;
          const sx = cx + arcR * Math.cos(a1);
          const sy = cy + arcR * Math.sin(a1);
          const ex = cx + arcR * Math.cos(a2);
          const ey = cy + arcR * Math.sin(a2);
          const midAngle = (f.angle + t.angle) / 2;
          const mx = cx + (r - 6) * Math.cos(midAngle * Math.PI / 180);
          const my = cy + (r - 6) * Math.sin(midAngle * Math.PI / 180);
          return (
            <g key={`ctrl-${from}-${to}`}>
              <path d={`M ${sx} ${sy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ex} ${ey}`}
                fill="none" stroke={`${t.color}30`} strokeWidth="1" strokeDasharray="3 4" />
              <text x={mx} y={my + 3} textAnchor="middle" fontSize="6" fill={`${t.color}50`} fontWeight={300}>
                controls
              </text>
            </g>
          );
        })}

        {/* Element circles */}
        {elements.map(el => {
          const a = el.angle * Math.PI / 180;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          return (
            <g key={el.name} className="element-node">
              <circle cx={x} cy={y} r={dotR} fill={`${el.color}15`} stroke={el.color} strokeWidth="1.5" />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fill={el.color} fontWeight={700}>
                {el.name}
              </text>
            </g>
          );
        })}

        {/* Center Tai Chi symbol */}
        <circle cx={cx} cy={cy} r="12" fill="rgba(201,168,76,0.03)" stroke="rgba(201,168,76,0.1)" strokeWidth="0.5" />
        <path d={`M${cx} ${cy - 6} A6 6 0 0 1 ${cx} ${cy} A3 3 0 0 0 ${cx} ${cy + 6} A6 6 0 0 1 ${cx} ${cy - 6}`} fill="rgba(201,168,76,0.2)" />
        <circle cx={cx} cy={cy - 3} r="1.5" fill="#0F1111" />
        <circle cx={cx} cy={cy + 3} r="1.5" fill="rgba(201,168,76,0.3)" />
      </svg>
      <p className="text-[10px] mt-2" style={{ color: '#6B6F80' }}>
        Solid: Generating Cycle (Sheng) · Dashed: Controlling Cycle (Ke)
      </p>
    </div>
  );
}

// ===================== Bazi Chart Preview =====================
function BaziPreview() {
  const pillars = [
    { stem: 'Year', glyph: '甲', element: 'Wood', color: '#27AE60' },
    { stem: 'Month', glyph: '丙', element: 'Fire', color: '#E74C3C' },
    { stem: 'Day', glyph: '庚', element: 'Metal', color: '#3B82F6' },
    { stem: 'Hour', glyph: '戊', element: 'Earth', color: '#F39C12' },
  ];

  return (
    <div className="text-center">
      <p className="text-xs mb-4" style={{ color: '#8B949E' }}>
        Four Pillars of Destiny — your birth decoded into eight characters
      </p>
      <div className="flex items-center justify-center gap-3">
        {pillars.map((p, i) => (
          <div key={p.stem} style={{
            textAlign: 'center',
          }}>
            <div className="text-[9px] font-semibold mb-2" style={{ color: '#6B6F80', letterSpacing: '0.05em' }}>
              {p.stem}
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(13,17,23,0.8)',
              border: `1px solid ${p.color}25`,
              borderRadius: '8px',
              minWidth: '56px',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: p.color, fontFamily: "'Noto Serif SC', serif", lineHeight: 1.2 }}>
                {p.glyph}
              </div>
              <div style={{ fontSize: '10px', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>
                {['子','戌','午','寅'][i]}
              </div>
            </div>
            <div className="text-[9px] mt-1.5" style={{ color: `${p.color}80`, fontWeight: 500 }}>
              {p.element}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-3" style={{ color: '#6B6F80' }}>
        Each pillar is a Heavenly Stem + Earthly Branch pair
      </p>
    </div>
  );
}

// ===================== STATS BAR =====================
function StatsBar() {
  const stats = [
    { value: '2,500+', label: 'Years of Tradition' },
    { value: '4', label: 'Pillars' },
    { value: '8', label: 'Characters' },
    { value: '10', label: 'Heavenly Stems' },
    { value: '12', label: 'Earthly Branches' },
    { value: '60', label: 'Cycle Years' },
  ];
  return (
    <div className="w-full max-w-4xl mb-10">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        style={{
          borderTop: '1px solid rgba(201,168,76,0.08)',
          borderBottom: '1px solid rgba(201,168,76,0.08)',
          padding: '10px 0',
        }}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: '#C9A84C', fontFamily: "'JetBrains Mono', monospace" }}>
              {s.value}
            </span>
            <span className="text-[10px]" style={{ color: '#6B6F80' }}>
              {s.label}
            </span>
            {i < stats.length - 1 && <span className="text-[8px] ml-1" style={{ color: '#3D3947' }}>
              |
            </span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== FAQ =====================
function FaqSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    { q: 'Is Ba Zi like Western astrology?', a: 'They share the same goal — understanding human nature through cosmic patterns — but the method is fundamentally different. Western astrology reads the sky (planetary positions at birth). Ba Zi reads the earth, using the Chinese Solar Calendar tied to the 24 Solar Terms. Ba Zi does not use planets, houses, or aspects. It uses Heavenly Stems, Earthly Branches, and the Five Elements.' },
    { q: 'Do I need an exact birth time?', a: 'Exact time gives the most accurate reading, especially for the Hour Pillar and luck cycles. If you don\'t know your time, we assume noon (12:00 PM). The reading will still be meaningful, but the Hour Pillar and certain time-sensitive calculations will have reduced accuracy.' },
    { q: 'What is True Solar Time?', a: 'Standard time zones are political boundaries that can deviate significantly from the actual solar position. True Solar Time adjusts your birth time based on your exact longitude so that noon corresponds to the sun being at its zenith. For locations far from their timezone meridian (e.g., western China or Spain), this can shift your reading by 30-60 minutes.' },
    { q: 'How is this different from a generic Ba Zi chart?', a: 'Most free Ba Zi calculators give you raw data — your stems, branches, and elements — but no interpretation. Our premium reports provide detailed analysis: your Day Master personality, hidden stems, ten deities, favorable elements, 10-year luck cycles, annual outlook, and personalized life guidance for career, relationships, and personal growth.' },
    { q: 'Can Ba Zi predict the future?', a: 'Ba Zi does not predict events. It describes tendencies — the kind of energy you are moving through at any given time. Think of it as a weather report for your life: it tells you whether you are in a storm season or a harvest season. What you do with that knowledge is entirely up to you.' },
    { q: 'Is this cultural appropriation?', a: 'We approach Ba Zi with deep respect for its Chinese origins. All our content is based on the classical Zi Ping methodology passed down through generations of Chinese scholars. We cite our sources, honor the tradition, and present it as a serious framework — not exotic mysticism. A portion of our proceeds supports preservation of traditional Chinese metaphysical texts.' },
  ];

  return (
    <div className="w-full max-w-4xl mb-16">
      <h2 className="heading-2 text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
        Common <span style={{ color: '#3B82F6' }}>
          Questions
        </span>
      </h2>
      <div style={{
        background: 'rgba(13,17,23,0.6)',
        border: '1px solid #202225',
        borderRadius: '15px',
        padding: '8px',
      }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{
            borderBottom: i < faqs.length - 1 ? '1px solid #202225' : 'none',
          }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between text-left px-4 py-3.5"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E6EDF3' }}>
              <span className="text-sm font-medium">
                {faq.q}
              </span>
              <span style={{
                color: '#C9A84C', fontSize: '14px', transition: 'transform 0.2s',
                transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}>
                +
              </span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-xs leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.8', maxWidth: '600px' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== REALTIME BAZI CHART =====================
function RealtimeBaziChart() {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');

  const STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
  const BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
  const ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  const ELEM_COLORS = { Wood: '#27AE60', Fire: '#E74C3C', Earth: '#F39C12', Metal: '#3B82F6', Water: '#2C3E50' };

  const calcBazi = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = timeStr ? parseInt(timeStr.split(':')[0]) : 12;
    const hourIdx = Math.floor((hour + 1) / 2) % 12;
    // Simplified calculation for demo
    const yearStem = (year - 4) % 10;
    const yearBranch = (year - 4) % 12;
    const monthStem = ((yearStem * 2 + month + 2) % 10 + 10) % 10;
    const monthBranch = ((month + 1) % 12 + 12) % 12;
    const dayStem = ((year * 5 + Math.floor(year / 4) + day + 5) % 10 + 10) % 10;
    const dayBranch = ((year * 5 + Math.floor(year / 4) + day + 5) % 12 + 12) % 12;
    const hourStem = ((dayStem % 5 * 2 + hourIdx) % 10 + 10) % 10;
    const hourBranch = hourIdx;

    const pillars = [
      { label: 'Year', stem: yearStem, branch: yearBranch },
      { label: 'Month', stem: monthStem, branch: monthBranch },
      { label: 'Day', stem: dayStem, branch: dayBranch },
      { label: 'Hour', stem: hourStem, branch: hourBranch },
    ];
    return pillars;
  };

  const handleDateChange = (val) => {
    setTestDate(val);
    setChart(calcBazi(val, testTime));
  };
  const handleTimeChange = (val) => {
    setTestTime(val);
    setChart(calcBazi(testDate, val));
  };

  return (
    <div className="w-full max-w-4xl mb-16">
      <h2 className="heading-2 text-2xl font-bold text-center mb-6" style={{ color: '#E6EDF3' }}>
        Your Four Pillars <span style={{ color: '#3B82F6' }}>
          Instantly
        </span>
      </h2>
      <p className="text-xs text-center mb-6" style={{ color: '#8B949E' }}>
        Type any date and see your Ba Zi chart generated in real time
      </p>
      <div style={{
        background: 'rgba(10,14,26,0.9)',
        border: '1px solid #202225',
        borderRadius: '15px',
        padding: '28px',
      }}>
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <input type="date" value={testDate} onChange={e => handleDateChange(e.target.value)}
            className="text-sm text-center"
            style={{ background: '#0F1111', border: '1px solid #202225', borderRadius: '5px', padding: '8px 12px', color: '#C9D1D9', colorScheme: 'dark', maxWidth: '180px' }} />
          <input type="time" value={testTime} onChange={e => handleTimeChange(e.target.value)}
            className="text-sm text-center"
            style={{ background: '#0F1111', border: '1px solid #202225', borderRadius: '5px', padding: '8px 12px', color: '#C9D1D9', colorScheme: 'dark', maxWidth: '140px' }} />
        </div>

        {chart ? (
          <div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {chart.map((p, i) => (
                <div key={p.label} style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div className="text-[9px] font-semibold mb-2" style={{ color: '#6B6F80', letterSpacing: '0.05em' }}>
                    {p.label}
                  </div>
                  <div style={{
                    background: 'rgba(10,14,26,0.8)',
                    border: `1px solid ${ELEM_COLORS[ELEMENTS[p.stem]]}25`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    transition: 'all 0.3s',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: ELEM_COLORS[ELEMENTS[p.stem]], fontFamily: "'Noto Serif SC', serif", lineHeight: 1.3 }}>
                      {STEMS[p.stem]}
                    </div>
                    <div style={{ fontSize: '9px', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>
                      {BRANCHES[p.branch]}
                    </div>
                  </div>
                  <div className="text-[9px] mt-1" style={{ color: `${ELEM_COLORS[ELEMENTS[p.stem]]}80` }}>
                    {ELEMENTS[p.stem]}
                  </div>
                  <div className="text-[7px] mt-0.5" style={{ color: '#3D3947', fontFamily: "'JetBrains Mono', monospace" }}>
                    {STEMS[p.stem]}-{BRANCHES[p.branch]}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px]" style={{ color: '#6B6F80' }}>
                Instant preview based on Solar Calendar. Full report includes Hidden Stems, Ten Deities, and Luck Cycles.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: '#6B6F80' }}>
              Enter your birth date above to see your Four Pillars in real time
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: '56px', height: '72px',
                  border: '1px dashed #202225',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: '#3D3947',
                }}>
                  ??
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== PRICING PREVIEW =====================
function PricingPreview() {
  return (
    <div className="w-full max-w-4xl mb-16">
      <h2 className="heading-2 text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
        Choose Your <span style={{ color: '#3B82F6' }}>
          Depth
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {/* Free Teaser */}
        <div style={{
          background: 'rgba(13,17,23,0.6)',
          border: '1px solid #202225',
          borderRadius: '15px',
          padding: '28px',
          textAlign: 'center',
        }}>
          <div className="text-xs font-bold mb-3" style={{ color: '#8B949E', letterSpacing: '0.05em' }}>
            FREE PREVIEW
          </div>
          <div className="text-2xl font-bold mb-3" style={{ color: '#E6EDF3' }}>
            $0
          </div>
          <div className="text-[10px] mb-4" style={{ color: '#6B6F80', lineHeight: '1.7' }}>
            Your Four Pillars with Day Master element
            <br />
            Basic element balance overview
            <br />
            Blurred preview of the full report
          </div>
        </div>

        {/* Premium Highlight */}
        <div style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '15px',
          padding: '28px',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
            background: '#3B82F6', color: '#fff', fontSize: '9px', fontWeight: 700,
            padding: '3px 12px', borderRadius: '10px', letterSpacing: '0.05em',
          }}>
            MOST POPULAR
          </div>
          <div className="text-xs font-bold mb-3" style={{ color: '#3B82F6', letterSpacing: '0.05em' }}>
            FULL REPORT
          </div>
          <div className="text-2xl font-bold mb-3" style={{ color: '#E6EDF3' }}>
            $49
          </div>
          <div className="text-[10px] mb-4" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
            Complete 12-page PDF report
            <br />
            Hidden Stems & Ten Deities
            <br />
            Favorable Elements & Missing Elements
            <br />
            Life Focus Guidance (Career / Love / Peace)
            <br />
            10-Year Luck Cycle Analysis
            <br />
            Current Year Outlook
          </div>
        </div>

        {/* Premium Plus */}
        <div style={{
          background: 'rgba(201,168,76,0.03)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '15px',
          padding: '28px',
          textAlign: 'center',
          gridColumn: '1 / -1',
          maxWidth: '320px',
          margin: '0 auto',
        }}>
          <div className="text-xs font-bold mb-3" style={{ color: '#C9A84C', letterSpacing: '0.05em' }}>
            PREMIUM
          </div>
          <div className="text-2xl font-bold mb-3" style={{ color: '#E6EDF3' }}>
            $99
          </div>
          <div className="text-[10px]" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
            Everything in Full Report plus:
            <br />
            Complete 20-page PDF
            <br />
            Extended 30-Year Luck Cycle Analysis
            <br />
            Year-by-Year Detail for Current Decade
            <br />
            Hidden Element Depth Analysis
            <br />
            Elemental Balance Therapy Recommendations
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== DECORATIVE DIVIDER =====================
function SectionDivider({ variant }) {
  if (variant === 'stars') {
    return (
      <div className="w-full max-w-4xl flex items-center justify-center gap-3 mb-8">
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
        <div className="flex items-center gap-2" style={{ color: '#3D3947', fontSize: '10px', letterSpacing: '0.3em' }}>
          ✦ ✦ ✦
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
      </div>
    );
  }
  if (variant === 'taiChi') {
    return (
      <div className="w-full max-w-4xl flex items-center justify-center mb-8" style={{ opacity: 0.3 }}>
        <svg width="24" height="24" viewBox="0 0 100 100">
          <path d="M50 5 A45 45 0 0 1 50 95 A22.5 22.5 0 0 1 50 50 A22.5 22.5 0 0 0 50 5 Z" fill="rgba(201,168,76,0.4)" />
          <circle cx="50" cy="27.5" r="10" fill="#0F1111" />
          <circle cx="50" cy="72.5" r="10" fill="rgba(201,168,76,0.4)" />
        </svg>
      </div>
    );
  }
  if (variant === 'line') {
    return (
      <div className="w-full max-w-4xl mb-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />
    );
  }
  return null;
}

// ===================== FOOTER =====================
function SiteFooter() {
  return (
    <div className="w-full" style={{
      borderTop: '1px solid #202225',
      padding: '40px 20px 24px',
      marginTop: '16px',
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-sm font-bold mb-2" style={{ color: '#E6EDF3' }}>
              <span style={{ color: '#3B82F6' }}>
                Soul
              </span>
              Elements
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
              Ancient Chinese metaphysics meets modern self-discovery.
              Understanding yourself through the Four Pillars of Destiny.
            </p>
          </div>
          {/* Links */}
          <div>
            <div className="text-[10px] font-bold mb-3" style={{ color: '#8B949E', letterSpacing: '0.05em' }}>
              EXPLORE
            </div>
            <div className="space-y-1.5">
              {['What is Ba Zi?', 'How It Works', 'The Five Elements', 'Pricing'].map(link => (
                <div key={link} className="text-[10px] cursor-pointer" style={{ color: '#6B6F80' }}
                  onClick={() => {
                    const id = link.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
                    if (id === 'what-is-ba-zi') document.getElementById('about-bazi')?.scrollIntoView({ behavior: 'smooth' });
                    else if (id === 'how-it-works') document.getElementById('input-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                  {link}
                </div>
              ))}
            </div>
          </div>
          {/* Legal */}
          <div>
            <div className="text-[10px] font-bold mb-3" style={{ color: '#8B949E', letterSpacing: '0.05em' }}>
              LEGAL
            </div>
            <div className="text-[10px] leading-relaxed" style={{ color: '#6B6F80', lineHeight: '1.8' }}>
              For entertainment and self-reflection purposes.
              <br />
              Not a substitute for professional advice.
              <br />
              <br />
              &copy; {new Date().getFullYear()} Soul Elements. All rights reserved.
            </div>
          </div>
        </div>
        <div className="text-center text-[9px]" style={{ color: '#3D3947' }}>
          Rooted in the Zi Ping Ba Zi tradition &middot; Inspired by 5,000 years of Chinese metaphysical wisdom
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN HOME PAGE =====================
export default function HomePage() {
  const router = useRouter();
  const { ref: revealRef, visible } = useScrollReveal();

  const [form, setForm] = useState({
    birthDate: '', birthTime: '', location: '', latitude: '', longitude: '',
    timezone: '', timezoneOffset: '', gender: '', goal: 'all', unknownTime: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [tstBadge, setTstBadge] = useState(null);
  const [tzAutoDetected, setTzAutoDetected] = useState(false);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const [showBaziHistory, setShowBaziHistory] = useState(false);
  const searchTimerRef = useRef(null);  // Refs don't cause stale closures
  // Auto-detect browser timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      for (const g of TZ_GROUPS) {
        const found = g.examples.find(e => e.name === tz);
        if (found) {
          setForm(prev => ({ ...prev, timezone: found.name, timezoneOffset: String(g.offset) }));
          setTzAutoDetected(true);
          break;
        }
      }
    } catch (e) {}
  }, []);

  // === CONSTELLATION STAR GENERATOR (CSS-only, no CPU overhead) ===
  // Generates a static star field using CSS custom properties.
  // Each star is a tiny dot with a random CSS animation delay for twinkling.
  useEffect(() => {
    const container = document.getElementById('constellation-stars');
    if (!container) return;
    const starCount = 60;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 4,
        opacity: 0.08 + Math.random() * 0.2,
      });
    }
    container.innerHTML = stars.map((s, i) =>
      `<div class="constellation-star" style="
        left:${s.x}%;top:${s.y}%;
        width:${s.size}px;height:${s.size}px;
        opacity:${s.opacity};
        animation-delay:-${s.delay}s;
        animation-duration:${s.duration}s;
      "></div>`
    ).join('');
  }, []);

  const searchLocation = useCallback(async (query) => {
    if (query.length < 3) { setLocationSuggestions([]); return; }
    setLocationSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setLocationSuggestions(data.map(d => ({ display: d.display_name, lat: d.lat, lon: d.lon, type: d.type })));
    } catch (e) { setLocationSuggestions([]); }
    finally { setLocationSearching(false); }
  }, []);

  const handleLocationInput = (value) => {
    setForm(prev => ({ ...prev, location: value }));
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => searchLocation(value), 400);
  };

  const selectLocationAndTz = async (loc) => {
    setForm(prev => ({ ...prev, location: loc.display, latitude: loc.lat, longitude: loc.lon }));
    setLocationSuggestions([]);
    setTouched(prev => ({ ...prev, location: true, latitude: true, longitude: true }));
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}&zoom=10&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const country = data?.address?.country_code?.toLowerCase() || '';
      const tzMap = {
        hk: { name: 'Asia/Hong_Kong', offset: 8 }, cn: { name: 'Asia/Shanghai', offset: 8 },
        sg: { name: 'Asia/Singapore', offset: 8 }, jp: { name: 'Asia/Tokyo', offset: 9 },
        kr: { name: 'Asia/Seoul', offset: 9 }, gb: { name: 'Europe/London', offset: 0 },
        fr: { name: 'Europe/Paris', offset: 1 }, de: { name: 'Europe/Berlin', offset: 1 },
        nz: { name: 'Pacific/Auckland', offset: 13 }, ae: { name: 'Asia/Dubai', offset: 4 },
        in: { name: 'Asia/Kolkata', offset: 5.5 }, tw: { name: 'Asia/Taipei', offset: 8 },
        th: { name: 'Asia/Bangkok', offset: 7 }, ph: { name: 'Asia/Manila', offset: 8 },
      };
      const guessed = tzMap[country];
      if (guessed) {
        setForm(prev => ({ ...prev, timezone: guessed.name, timezoneOffset: String(guessed.offset) }));
        setTzAutoDetected(false);
        updateTstBadge(parseFloat(loc.lon), guessed.offset);
      }
    } catch (e) {}
  };

  const updateTstBadge = (lon, tzOffset) => {
    if (lon && tzOffset) {
      const diff = (lon - tzOffset * 15) * 4;
      if (Math.abs(diff) > 0.5) {
        setTstBadge({ text: `Location adjusted by ${Math.round(Math.abs(diff))} min (${diff >= 0 ? 'ahead of' : 'behind'} local time) for True Solar Time accuracy`, type: 'adjusted' });
      } else {
        setTstBadge({ text: 'Location aligned with timezone meridian — no adjustment needed', type: 'aligned' });
      }
    } else setTstBadge(null);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSelectTz = (tzName, offset) => {
    setForm(prev => ({ ...prev, timezone: tzName, timezoneOffset: String(offset) }));
    setTzAutoDetected(false);
    setShowTzPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.birthDate) { setError('Date of birth is required.'); setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime: form.unknownTime ? null : (form.birthTime || '12:00'),
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          timezoneOffset: form.timezoneOffset ? parseFloat(form.timezoneOffset) : null,
          timezone: form.timezone || null,
          gender: form.gender || null,
          goal: form.goal || 'all',
          unknownTime: form.unknownTime,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');
      const previewKey = `preview_${data.reportId}`;
      sessionStorage.setItem(previewKey, JSON.stringify(data));
      router.push(`/preview?key=${encodeURIComponent(previewKey)}`);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const currentTzLabel = (() => {
    if (!form.timezone) return '';
    const sign = form.timezoneOffset >= 0 ? '+' : '';
    for (const g of TZ_GROUPS) {
      const found = g.examples.find(e => e.name === form.timezone);
      if (found) return `${found.label} (UTC${sign}${form.timezoneOffset})`;
    }
    return `${form.timezone.split('/').pop().replace('_', ' ')} (UTC${sign}${form.timezoneOffset})`;
  })();

  const filteredTzGroups = TZ_GROUPS.filter(g => {
    if (!tzSearch) return true;
    const q = tzSearch.toLowerCase();
    return g.cities.toLowerCase().includes(q) || g.label.toLowerCase().includes(q) || g.examples.some(e => e.label.toLowerCase().includes(q));
  });

  // ===================== REVEAL WRAPPER COMPONENT =====================
  function RevealSection({ id, children, className = 'w-full max-w-4xl mb-16' }) {
    return (
      <div id={id} data-reveal={id} className={className}
        style={{
          // Always visible. Fade-in from useEffect is a progressive enhancement.
          opacity: 1,
          transform: 'translateY(0)',
        }}>
        {children}
      </div>
    );
  }

  // Wrapper for alternating section backgrounds
  function SectionWrapper({ children, alt = false }) {
    return (
      <div style={{
        width: '100%',
        background: alt ? '#12161D' : 'transparent',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: alt ? '48px 16px' : '0 16px',
      }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* ANIMATED TAI CHI + STAR BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/bg-design.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.22,
        }} />
        {/* Tai Chi ornaments using CSS animations */}
        <div className="tai-chi-ornament tai-chi-ornament-1" style={{ top: '5%', right: '-5%' }}>
          <svg viewBox="0 0 200 200" width="500" height="500">
            <defs>
              <clipPath id="taiChiBg">
                <path d="M100 10 A90 90 0 0 1 100 190 A45 45 0 0 1 100 100 A45 45 0 0 0 100 10 Z" />
              </clipPath>
            </defs>
            <circle cx="100" cy="100" r="90" fill="#C9A84C" />
            <circle cx="100" cy="55" r="20" fill="#07070D" />
            <circle cx="100" cy="145" r="20" fill="#C9A84C" />
          </svg>
        </div>
        <div className="tai-chi-ornament tai-chi-ornament-2" style={{ bottom: '5%', left: '-3%' }}>
          <svg viewBox="0 0 200 200" width="350" height="350">
            <circle cx="100" cy="100" r="90" fill="#C9A84C" />
            <path d="M100 10 A45 45 0 0 0 100 100 A90 90 0 0 0 100 190 A45 45 0 0 1 100 100 A45 45 0 0 1 100 10 Z" fill="#07070D" />
            <circle cx="100" cy="55" r="18" fill="#C9A84C" />
            <circle cx="100" cy="145" r="18" fill="#07070D" />
          </svg>
        </div>
        {/* Star dot field rendered via CSS gradients (lighter than individual divs) */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(1px 1px at 15% 20%, rgba(201,168,76,0.35), transparent),' +
            'radial-gradient(1px 1px at 25% 65%, rgba(201,168,76,0.25), transparent),' +
            'radial-gradient(1.5px 1.5px at 35% 15%, rgba(255,215,120,0.3), transparent),' +
            'radial-gradient(1px 1px at 45% 75%, rgba(201,168,76,0.2), transparent),' +
            'radial-gradient(1px 1px at 55% 25%, rgba(255,215,120,0.25), transparent),' +
            'radial-gradient(1.5px 1.5px at 65% 55%, rgba(201,168,76,0.2), transparent),' +
            'radial-gradient(1px 1px at 75% 35%, rgba(255,215,120,0.15), transparent),' +
            'radial-gradient(1px 1px at 85% 80%, rgba(201,168,76,0.2), transparent),' +
            'radial-gradient(1.2px 1.2px at 20% 85%, rgba(201,168,76,0.2), transparent),' +
            'radial-gradient(1px 1px at 50% 45%, rgba(255,255,255,0.12), transparent),' +
            'radial-gradient(1px 1px at 70% 10%, rgba(201,168,76,0.15), transparent),' +
            'radial-gradient(1.2px 1.2px at 90% 50%, rgba(201,168,76,0.2), transparent),' +
            'radial-gradient(1px 1px at 5% 50%, rgba(255,215,120,0.15), transparent),' +
            'radial-gradient(1px 1px at 40% 90%, rgba(201,168,76,0.15), transparent),' +
            'radial-gradient(1px 1px at 95% 15%, rgba(255,255,255,0.1), transparent)',
        }} />
      </div>

      <div id="constellation-stars" className="fixed inset-0 z-[1] pointer-events-none" style={{ opacity: 0.35 }} />

      <div ref={revealRef} className="relative z-[2] min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '4vh' }}>

        {/* ========== HERO SECTION — Enhanced ========== */}
        <div className="w-full max-w-4xl text-center mb-8" style={{ paddingTop: '10vh' }}>
          {/* Gold tai chi emblem with glow */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
            style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              boxShadow: '0 0 40px rgba(201,168,76,0.06)',
              animation: 'glowPulse 4s ease-in-out infinite',
            }}>
            <svg width="36" height="36" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.4" />
              <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 0 50 50 A23 23 0 0 1 50 4" fill="#C9A84C" opacity="0.8" />
              <circle cx="50" cy="73" r="7" fill="#07080A" />
              <circle cx="50" cy="27" r="7" fill="#C9A84C" />
            </svg>
          </div>

          {/* Dramatic heading with Playfair Display */}
          <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            style={{ color: '#E6EDF3', lineHeight: '1.0' }}>
            Discover Your<br />
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #D4B85A 40%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Soul Element</span>
          </h1>

          {/* Refined subtitle */}
          <p className="max-w-2xl mx-auto mb-10" style={{
            color: '#8B949E',
            fontSize: '17px',
            lineHeight: '1.8',
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontStyle: 'italic',
          }}>
            Precision-mapped with sub-30-second True Solar Time accuracy.
            Your Day Master reveals how you make decisions, handle stress,
            and relate to others — decoded by our custom Ba Zi engine.
          </p>

          {/* Refined CTA buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => document.getElementById('input-form')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #B8962E)',
                border: '1px solid #C9A84C',
                borderRadius: '8px',
                padding: '14px 36px',
                color: '#07080A', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
                letterSpacing: '0.01em',
              }}>
              Begin Your Reading
            </button>
            <button onClick={() => document.getElementById('about-bazi')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '14px 28px',
                color: '#E6EDF3', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              What is Ba Zi?
            </button>
            <button onClick={() => document.getElementById('oracle-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: '8px',
                padding: '14px 24px',
                color: '#C9A84C', fontSize: '13px', fontWeight: 400, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              Draw a Fortune Stick
            </button>
          </div>
        </div>

        {/* ========== STATS BAR ========== */}
        <RevealSection id="stats-bar">
          <StatsBar />
        </RevealSection>

        {/* ========== INPUT FORM ========== */}
        <div id="input-form" className="w-full max-w-lg mb-12">
          <div style={{
            background: 'rgba(13,17,23,0.9)',
            border: '1px solid #202225',
            borderRadius: '15px',
            padding: '36px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#E6EDF3' }}>
              Your Cosmic Blueprint
            </h2>
            <p className="text-xs text-center mb-6" style={{ color: '#8B949E' }}>
              Enter your birth details to unlock your destiny
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div className="text-center">
                <label className="block text-xs mb-1.5" style={{ color: '#3B82F6' }}>Date of Birth *</label>
                <input type="date" value={form.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)} required
                  className="w-full max-w-[220px] mx-auto text-center"
                  style={{ background: '#0F1111', border: '2px solid #202225', borderRadius: '5px', padding: '10px', color: '#C9D1D9', colorScheme: 'dark' }} />
              </div>

              {/* Time */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                  <label className="text-xs" style={{ color: '#3B82F6' }}>Time of Birth</label>
                  <label className="flex items-center gap-1 text-xs" style={{ color: '#6B6F80', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.unknownTime} onChange={e => handleChange('unknownTime', e.target.checked)} />
                    Unknown
                  </label>
                </div>
                {!form.unknownTime ? (
                  <input type="time" value={form.birthTime} onChange={e => handleChange('birthTime', e.target.value)}
                    style={{ background: '#0F1111', border: '2px solid #202225', borderRadius: '5px', padding: '10px', color: '#C9D1D9', colorScheme: 'dark' }}
                    className="w-full max-w-[220px] mx-auto text-center" />
                ) : (
                  <div className="text-xs p-2.5 rounded max-w-[280px] mx-auto" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#8B949E' }}>
                    Noon (12:00 PM) assumed. Accuracy may be reduced.
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #202225', maxWidth: '160px', margin: '16px auto' }} />

              {/* Location */}
              <div className="text-center">
                <label className="block text-xs mb-1.5" style={{ color: '#3B82F6' }}>Birth Location</label>
                <div className="relative max-w-[320px] mx-auto">
                  <input type="text" placeholder="Search city, e.g. Hong Kong, London..."
                    value={form.location}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    style={{ background: '#0F1111', border: '2px solid #202225', borderRadius: '5px', padding: '10px', color: '#C9D1D9' }}
                    className="w-full text-center text-sm" />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-0.5 z-10 text-left rounded-lg overflow-hidden"
                      style={{ background: '#0F1728', border: '1px solid #202225', maxHeight: '200px', overflowY: 'auto' }}>
                      {locationSuggestions.map((loc, i) => (
                        <button key={i} type="button" onClick={() => selectLocationAndTz(loc)}
                          className="w-full text-xs text-left px-3 py-2.5 transition-colors"
                          style={{ color: '#8B949E', borderBottom: i < locationSuggestions.length - 1 ? '1px solid #202225' : 'none' }}>
                          {loc.display.split(',')[0]}, {loc.display.split(',').slice(1, 3).join(',')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#6B6F80' }}>Enter your birth city — timezone and True Solar Time will adjust automatically</p>
                {tstBadge && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] mt-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: tstBadge.type === 'adjusted' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${tstBadge.type === 'adjusted' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`, color: tstBadge.type === 'adjusted' ? '#3B82F6' : '#10B981' }}>
                    <span>{tstBadge.type === 'adjusted' ? '' : ''}</span>
                    <span>{tstBadge.text}</span>
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div className="text-center">
                <label className="block text-xs mb-1.5" style={{ color: '#3B82F6' }}>Birth Timezone</label>
                <button type="button" onClick={() => setShowTzPicker(true)}
                  className="flex items-center justify-center gap-2 mx-auto py-2.5 px-4 rounded transition-all text-sm"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: form.timezone ? '#3B82F6' : '#6B6F80', maxWidth: '300px', width: '100%' }}>
                  <span>{form.timezone ? currentTzLabel : 'Select your birth timezone'}</span>
                  {tzAutoDetected && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Auto</span>}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <p className="text-[10px] mt-1" style={{ color: '#6B6F80', maxWidth: '280px', margin: '4px auto 0' }}>
                  {tzAutoDetected ? 'Detected from your browser — change if your birth city has a different timezone' : 'Make sure this matches your birth city, not your current residence'}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #202225', maxWidth: '160px', margin: '16px auto' }} />

              {/* Gender */}
              <div className="text-center">
                <label className="block text-xs mb-1.5" style={{ color: '#3B82F6' }}>Gender</label>
                <div className="flex items-center justify-center gap-2">
                  {['male', 'female', ''].map(g => (
                    <button key={g} type="button" onClick={() => handleChange('gender', g)}
                      style={{
                        background: form.gender === g ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.gender === g ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                        color: form.gender === g ? '#3B82F6' : '#6B6F80',
                        borderRadius: '5px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer',
                      }}>
                      {g === '' ? 'Skip' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Life Focus */}
              <div className="text-center">
                <label className="block text-xs mb-1.5" style={{ color: '#3B82F6' }}>Life Focus</label>
                <div className="flex items-center justify-center gap-2">
                  {[
                    { value: 'career', label: 'Career' },
                    { value: 'love', label: 'Love' },
                    { value: 'peace', label: 'Peace' },
                    { value: 'all', label: 'All' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => handleChange('goal', opt.value)}
                      style={{
                        background: form.goal === opt.value ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.goal === opt.value ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                        color: form.goal === opt.value ? '#3B82F6' : '#6B6F80',
                        borderRadius: '5px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded text-sm text-center max-w-[300px] mx-auto" style={{ background: 'rgba(224,88,88,0.08)', border: '1px solid rgba(224,88,88,0.2)', color: '#E05858' }}>
                  {error}
                </div>
              )}

              <div className="text-center pt-2">
                <button type="submit" disabled={loading}
                  style={{
                    background: loading ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3B82F6, #2980B9)',
                    border: '2px solid #3B82F6',
                    borderRadius: '25px',
                    padding: '14px 36px',
                    color: '#fff', fontSize: '15px', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                  }}>
                  {loading ? 'Reading the stars...' : 'Reveal My Destiny'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========== HOW IT WORKS ========== */}
        <SectionWrapper>
          <RevealSection id="how-it-works">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
              How It <span style={{ color: '#3B82F6' }}>Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { step: '01', title: 'Enter Your Details', desc: 'Share your date, time, and place of birth. Our engine calculates your exact Four Pillars using the Chinese Solar Calendar with True Solar Time correction.' },
                { step: '02', title: 'Receive Your Reading', desc: 'Your personalized Ba Zi chart reveals your Day Master element, hidden stems, ten deities, luck cycles, and more — all in a beautifully formatted report.' },
                { step: '03', title: 'Apply the Wisdom', desc: 'Use your cosmic blueprint to make better decisions about career, relationships, timing, and personal growth. Ancient wisdom for modern life.' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(13,17,23,0.6)',
                  border: '1px solid #202225',
                  borderRadius: '15px',
                  padding: '28px',
                  textAlign: 'center',
                }}>
                  <div className="text-lg font-bold mb-1" style={{ color: '#3B82F6', opacity: 0.4 }}>{item.step}</div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#E6EDF3' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="stars" />

        {/* ========== FEATURES + BAZI PREVIEW ========== */}
        <SectionWrapper alt>
          <RevealSection id="features">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
              What You'll <span style={{ color: '#3B82F6' }}>Discover</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[
                { icon: '', title: 'Four Pillars', text: 'Discover your Year, Month, Day, and Hour Pillars based on your exact birth time and location.' },
                { icon: '', title: 'Five Elements', text: 'Understand the cosmic balance of Wood, Fire, Earth, Metal, and Water within you.' },
                { icon: '', title: 'Life Guidance', text: 'Personalized insights into your career, relationships, and life path.' },
              ].map(f => (
                <div key={f.title} className="text-center p-5 rounded-lg" style={{ background: 'rgba(13,17,23,0.6)', border: '1px solid #202225' }}>
                  <div className="text-xl mb-2" style={{ color: '#3B82F6', opacity: 0.6 }}>{f.icon}</div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#E6EDF3' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B949E' }}>{f.text}</p>
                </div>
              ))}
            </div>
            {/* Ba Zi Chart Preview */}
            <BaziPreview />
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="taiChi" />

        {/* ========== WHAT IS BA ZI ========== */}
        <SectionWrapper>
          <RevealSection id="about-bazi">
            <h2 className="heading-2 text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
              What is <span style={{ color: '#3B82F6' }}>Ba Zi</span>?
            </h2>
            <div style={{
              background: 'rgba(13,17,23,0.8)',
              border: '1px solid #202225',
              borderRadius: '15px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-base leading-relaxed mb-4" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                    Imagine a system so precise that it can take the exact moment of your birth &mdash;
                    down to the hour and minute &mdash; and construct a complete map of your innate nature,
                    your strengths, your blind spots, and the rhythms of fortune that will play out across
                    your entire lifetime. This is not ancient mysticism dressed in vague language. This is
                    Ba Zi, a rigorous symbolic calculus that has been refined over two thousand years.
                  </p>
                  <p className="text-base leading-relaxed mb-4" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                    The name means &quot;Eight Characters&quot; &mdash; the eight Chinese glyphs that encode your
                    destiny: one Heavenly Stem and one Earthly Branch for each of the four pillars (Year,
                    Month, Day, Hour). But calling it a &quot;fortune-telling system&quot; would be like calling
                    the periodic table a &quot;recipe book.&quot; It is a sophisticated framework for understanding
                    how energy organizes itself at a particular moment in spacetime, and how that
                    organization shapes everything from your personality to your life trajectory.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                    What makes Ba Zi different from Western astrology? Western traditions read the sky &mdash;
                    the positions of planets and stars at the moment of birth. Ba Zi reads the earth. It uses
                    the Chinese Solar Calendar, which is tied not to the moon but to the 24 Solar Terms &mdash;
                    the precise astronomical points where the sun reaches specific degrees of celestial longitude.
                    This gives Ba Zi an anchor in measurable physical reality that makes it uniquely suited
                    for the scientific-minded seeker.
                  </p>
                </div>
                <div style={{ borderLeft: '1px solid #202225', paddingLeft: '32px' }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#3B82F6' }}>A 5,000-Year Conversation</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                    Ba Zi was not invented in a single moment. It was refined over millennia — from
                    Emperor Fu Xi&apos;s eight trigrams (2800 BCE) through the Tang and Song dynasties into
                    the sophisticated system used today.
                  </p>
                  {showBaziHistory && (
                    <>
                      <p className="text-base leading-relaxed mb-4" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                        The story does not begin with a fortune-teller in a market stall. It begins with
                        Emperor Fu Xi, the mythical sage-king of ancient China, who around 2800 BCE is said
                        to have observed the patterns of the natural world &mdash; the changing of seasons, the
                        flow of rivers, the dance of animals &mdash; and distilled them into eight trigrams.
                        These eight figures, composed of broken and unbroken lines, became the foundation of
                        the I Ching, or Book of Changes, the oldest continuously consulted text in human history.
                      </p>
                      <p className="text-base leading-relaxed mb-4" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                        Around 1143 BCE, King Wen of Zhou, while under house arrest by a tyrannical ruler,
                        expanded the eight trigrams into 64 hexagrams and wrote the first layer of the I Ching&apos;s
                        text. What is remarkable is that he did this in captivity &mdash; a man stripped of power,
                        sitting in a cell, mapping the entire cosmos with nothing but his mind. Centuries later,
                        Confucius (551-479 BCE) added the &quot;Ten Wings&quot; commentaries, transforming the I Ching
                        from a divination manual into a philosophical masterpiece.
                      </p>
                      <p className="text-base leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.8' }}>
                        During the Tang Dynasty (618-907 CE), the scholar Li Xu Zhong achieved a breakthrough:
                        he formalized the Four Pillars system by combining the I Ching&apos;s yin-yang philosophy
                        with the Five Elements (Wu Xing), the Ten Heavenly Stems, and the Twelve Earthly
                        Branches into a single unified framework. Later, during the Song Dynasty, Xu Zi Ping
                        refined it further, and the system we use today bears his name: Zi Ping Ba Zi. Every
                        modern Ba Zi reading, including the one generated by this website, traces its lineage
                        directly to these two men.
                      </p>
                    </>
                  )}
                  <button onClick={() => setShowBaziHistory(!showBaziHistory)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#C9A84C', fontSize: '12px', padding: '8px 0', marginTop: '8px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                    {showBaziHistory ? 'Collapse history' : 'Read the full history'}
                    <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: showBaziHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </button>
                </div>
              </div>

              {/* Key Concepts Cards */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #202225' }}>
                <h3 className="text-base font-bold text-center mb-5" style={{ color: '#E6EDF3' }}>The Three Pillars of Ba Zi</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Yin & Yang', icon: '', text: 'The fundamental duality. Everything in the universe is a dance between receptive (Yin) and active (Yang) energies. Your Day Master has a yin or yang nature that colors your entire approach to life.' },
                    { title: 'The Five Elements', icon: '', text: 'Wood, Fire, Earth, Metal, and Water are not substances but phases of energy. They generate and control each other in an endless cycle.' },
                    { title: 'Ten Stems & Twelve Branches', icon: '', text: 'The Heavenly Stems and Earthly Branches form a 60-year cycle that encodes time itself. Each combination has a unique personality, strengths, and challenges.' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'rgba(59,130,246,0.03)',
                      border: '1px solid rgba(59,130,246,0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}>
                      <div className="text-xl mb-2" style={{ color: '#3B82F6', opacity: 0.6 }}>{item.icon}</div>
                      <h4 className="text-sm font-bold mb-2" style={{ color: '#3B82F6' }}>{item.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#8B949E', lineHeight: '1.7' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="line" />

        {/* ========== THE FIVE ELEMENTS DEEP DIVE + SVG CYCLE ========== */}
        <SectionWrapper alt>
          <RevealSection id="five-elements">
            <h2 className="heading-2 text-2xl font-bold text-center mb-8" style={{ color: '#E6EDF3' }}>
              The Five Elements: A <span style={{ color: '#3B82F6' }}>Living</span> Cycle
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{
              background: 'rgba(13,17,23,0.8)',
              border: '1px solid #202225',
              borderRadius: '15px',
              padding: '36px',
            }}>
              {/* SVG Diagram */}
              <div className="flex items-center justify-center">
                <FiveElementsCycle />
              </div>
              {/* Element Cards */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { el: 'Wood', color: '#27AE60', emoji: '', phase: 'Birth & Growth', desc: 'Expansion, creativity, spring morning. Wood energy pushes upward and breaks through obstacles.' },
                  { el: 'Fire', color: '#E74C3C', emoji: '', phase: 'Peak & Expression', desc: 'Maximum expansion, heat, midday summer. Fire energy radiates outward and transforms.' },
                  { el: 'Earth', color: '#F39C12', emoji: '', phase: 'Stabilization', desc: 'Harvest, grounding, late afternoon. Earth energy collects, nourishes, and holds.' },
                  { el: 'Metal', color: '#3B82F6', emoji: '', phase: 'Contraction & Structure', desc: 'Precision, discipline, autumn evening. Metal energy cuts, refines, and defines boundaries.' },
                  { el: 'Water', color: '#2C3E50', emoji: '', phase: 'Stillness & Storage', desc: 'Rest, wisdom, deep winter night. Water energy stores, reflects, and adapts.' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(59,130,246,0.03)',
                    border: '1px solid rgba(59,130,246,0.08)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: item.color, flexShrink: 0,
                    }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.el}</span>
                        <span className="text-[8px]" style={{ color: '#6B6F80' }}>{item.phase}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: '#8B949E' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="stars" />



        <SectionDivider variant="line" />

        {/* ========== FAQ ========== */}
        <SectionWrapper>
          <RevealSection id="faq">
            <FaqSection />
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="stars" />

        {/* ========== FORTUNE STICK ORACLE ========== */}
        <SectionWrapper alt>
          <RevealSection id="oracle-section">
            <FortuneStickOracle />
          </RevealSection>
        </SectionWrapper>

        <SectionDivider variant="line" />

        {/* ========== REALTIME BAZI CHART ========== */}
        <SectionWrapper>
          <RevealSection id="realtime-bazi">
            <RealtimeBaziChart />
          </RevealSection>
        </SectionWrapper>
        <SectionDivider variant="stars" />

        {/* ========== PRICING PREVIEW ========== */}
        <SectionWrapper>
          <RevealSection id="pricing">
            <PricingPreview />
          </RevealSection>
        </SectionWrapper>

        {/* ========== FOOTER ========== */}
        <SiteFooter />
      </div>

      {/* TIMEZONE PICKER MODAL */}
      {showTzPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTzPicker(false); }}>
          <div className="w-full max-w-sm max-h-[70vh] rounded-lg overflow-hidden flex flex-col"
            style={{ background: '#0F1728', border: '1px solid #202225' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#202225' }}>
              <span className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Select Timezone</span>
              <button type="button" onClick={() => setShowTzPicker(false)} className="text-sm px-2 py-1 rounded" style={{ color: '#6B6F80' }}>&#10005;</button>
            </div>
            <div className="p-3">
              <input type="text" placeholder="Search city or offset..."
                value={tzSearch} onChange={e => setTzSearch(e.target.value)}
                style={{ background: '#0F1111', border: '1px solid #202225', borderRadius: '5px', padding: '8px', color: '#C9D1D9' }}
                className="w-full text-xs text-center" />
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
              <button type="button" onClick={() => {
                try {
                  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                  for (const g of TZ_GROUPS) {
                    const found = g.examples.find(e => e.name === tz);
                    if (found) { handleSelectTz(found.name, g.offset); return; }
                  }
                } catch (e) {}
              }}
                className="w-full text-xs text-center py-2.5 rounded transition-colors mb-3"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                Use device timezone
              </button>
              {filteredTzGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="text-[10px] font-semibold py-1.5" style={{ color: '#6B6F80' }}>
                    {group.label} — {group.cities}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.examples.map((ex, ei) => {
                      const isSelected = form.timezone === ex.name;
                      return (
                        <button key={ei} type="button" onClick={() => handleSelectTz(ex.name, group.offset)}
                          style={{
                            background: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                            color: isSelected ? '#3B82F6' : '#8B949E',
                            borderRadius: '5px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer',
                          }}>
                          {ex.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
