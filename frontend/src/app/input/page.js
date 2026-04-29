'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = '';

// --- Time presets for step 1 ---
const TIME_PRESETS = [
  { label: 'Morning 7-9am', value: '07:00' },
  { label: 'Noon 12pm', value: '12:00' },
  { label: 'Afternoon 3pm', value: '15:00' },
  { label: 'Evening 6pm', value: '18:00' },
  { label: 'Night 9pm', value: '21:00' },
];

// --- Step labels ---
const STEPS = [
  { index: 0, label: 'Birth Details' },
  { index: 1, label: 'Location' },
  { index: 2, label: 'About You' },
];

// --- Inline style helpers ---
const s = (styles) => styles;

// ===================== COMPONENT =====================
function InputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    birthDate: '',
    birthTime: '',
    location: '',
    latitude: '',
    longitude: '',
    timezone: '',
    timezoneOffset: '',
    gender: '',
    goal: 'all',
    unknownTime: false,
    tier: 'standard',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [fadeIn, setFadeIn] = useState(true);
  // Pull tier from URL safely after mount
  useEffect(() => {
    try {
      const tier = searchParams.get('tier');
      if (tier === 'grandmaster') setForm(prev => ({ ...prev, tier: 'grandmaster' }));
    } catch {}
  }, [searchParams]);

  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const cityDebounce = useRef(null);
  const cityRef = useRef(null);

  // Advanced toggle for step 2
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // --- City autocomplete with Nominatim ---
  useEffect(() => {
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (cityQuery.length < 3) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    cityDebounce.current = setTimeout(async () => {
      setCityLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=5&featureType=city`,
          { headers: { 'User-Agent': 'SoulElements/1.0' } }
        );
        const data = await res.json();
        const mapped = (data || []).map(item => ({
          display: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
        setCityResults(mapped);
        setShowCityDropdown(mapped.length > 0);
      } catch {
        setCityResults([]);
        setShowCityDropdown(false);
      } finally {
        setCityLoading(false);
      }
    }, 350);
  }, [cityQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Auto-detect timezone from lat/lon ---
  const detectTimezone = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { headers: { 'User-Agent': 'SoulElements/1.0' } }
      );
      const data = await res.json();
      const tzRaw = data?.extratags?.timezone || '';
      if (tzRaw) {
        const offset = getTimezoneOffset(tzRaw);
        setForm(prev => ({
          ...prev,
          timezone: tzRaw,
          timezoneOffset: offset !== null ? String(offset) : '',
          latitude: lat,
          longitude: lon,
          location: data?.display_name?.split(',').slice(0, 2).join(', ') || '',
        }));
      } else {
        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));
      }
    } catch {
      // Fallback: just set lat/lon
      setForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
    }
  }, []);

  const getTimezoneOffset = (tzName) => {
    try {
      const now = new Date();
      const jan = new Date(now.getFullYear(), 0, 1);
      const jul = new Date(now.getFullYear(), 6, 1);
      const intlJan = Intl.DateTimeFormat('en', { timeZone: tzName, timeZoneName: 'shortOffset' });
      const intlJul = Intl.DateTimeFormat('en', { timeZone: tzName, timeZoneName: 'shortOffset' });
      const janStr = intlJan.format(jan);
      const julStr = intlJul.format(jul);
      const extractOffset = (str) => {
        const m = str.match(/([+-]\d+)/);
        return m ? parseInt(m[1], 10) : null;
      };
      return extractOffset(janStr) || extractOffset(julStr) || null;
    } catch {
      return null;
    }
  };

  // --- Handle city select ---
  const handleCitySelect = useCallback((item) => {
    setForm(prev => ({ ...prev, location: item.display }));
    setCityQuery(item.display);
    setShowCityDropdown(false);
    detectTimezone(item.lat, item.lon);
  }, [detectTimezone]);

  // --- Time preset click ---
  const handleTimePreset = (value) => {
    handleChange('birthTime', value);
  };

  // --- Validation per step ---
  const validateStep = (s) => {
    if (s === 0) {
      if (!form.birthDate) return 'Date of birth is required.';
      return null;
    }
    if (s === 1) {
      return null; // Location is optional
    }
    if (s === 2) {
      return null;
    }
    return null;
  };

  // --- Navigation ---
  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setFadeIn(false);
    setTimeout(() => {
      setStep(prev => Math.min(prev + 1, 2));
      setFadeIn(true);
    }, 200);
  };

  const prevStep = () => {
    setError('');
    setFadeIn(false);
    setTimeout(() => {
      setStep(prev => Math.max(prev - 1, 0));
      setFadeIn(true);
    }, 200);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.birthDate) {
      setError('Date of birth is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime: form.unknownTime ? null : (form.birthTime || '12:00'),
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          timezoneOffset: form.timezoneOffset ? parseInt(form.timezoneOffset, 10) : null,
          timezone: form.timezone || null,
          gender: form.gender || null,
          goal: form.goal || 'all',
          unknownTime: form.unknownTime,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      const previewKey = `preview_${data.reportId}`;
      sessionStorage.setItem(previewKey, JSON.stringify(data));
      router.push(`/preview?key=${encodeURIComponent(previewKey)}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===================== RENDER HELPERS =====================

  const renderProgressBar = () => (
    <div style={s({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '32px', padding: '0 8px' })}>
      {STEPS.map((s, i) => (
        <div key={s.index} style={s({ display: 'flex', alignItems: 'center' })}>
          {/* Step dot + label */}
          <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' })}>
            <div style={s({
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
              border: i <= step ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
              boxShadow: i <= step ? '0 0 8px var(--gold-glow)' : 'none',
            })} />
            <span style={s({
              fontSize: '8px',
              color: i <= step ? 'var(--gold)' : 'var(--text-quaternary)',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s',
              letterSpacing: '0.02em',
              fontWeight: i <= step ? 500 : 400,
            })}>
              {s.label}
            </span>
          </div>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div style={s({
              width: '48px', height: '1px',
              margin: '0 8px',
              marginBottom: '16px',
              background: i < step
                ? 'var(--gold-border)'
                : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s',
            })} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div style={s({ animation: fadeIn ? 'fadeIn 0.3s ease' : 'none', textAlign: 'center' })}>
      {/* Date of Birth */}
      <div style={s({ marginBottom: '20px' })}>
        <label style={s({ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em' })}>
          DATE OF BIRTH *
        </label>
        <input
          type="date"
          value={form.birthDate}
          onChange={(e) => handleChange('birthDate', e.target.value)}
          onBlur={() => handleBlur('birthDate')}
          required
          style={s({
            width: '100%', maxWidth: '240px', margin: '0 auto', display: 'block',
            colorScheme: 'dark', textAlign: 'center',
            border: touched.birthDate && !form.birthDate ? '1px solid var(--error)' : undefined,
          })}
        />
        {touched.birthDate && !form.birthDate && (
          <p style={s({ fontSize: '10px', marginTop: '6px', color: 'rgba(255,80,80,0.8)' })}>
            Please select your date of birth
          </p>
        )}
      </div>

      {/* Time of Birth */}
      <div style={s({ marginBottom: '20px' })}>
        <div style={s({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' })}>
          <label style={s({ fontSize: '11px', color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em' })}>
            TIME OF BIRTH
          </label>
          <label style={s({ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-tertiary)', cursor: 'pointer' })}>
            <input
              type="checkbox"
              checked={form.unknownTime}
              onChange={(e) => handleChange('unknownTime', e.target.checked)}
              style={s({ width: '14px', height: '14px', accentColor: 'var(--gold)' })}
            />
            I don't know
          </label>
        </div>

        {!form.unknownTime ? (
          <>
            <input
              type="time"
              value={form.birthTime}
              onChange={(e) => handleChange('birthTime', e.target.value)}
              style={s({
                width: '100%', maxWidth: '240px', margin: '0 auto', display: 'block',
                colorScheme: 'dark', textAlign: 'center', marginBottom: '12px',
              })}
            />
            {/* Time presets */}
            <div style={s({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', maxWidth: '340px', margin: '0 auto' })}>
              {TIME_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleTimePreset(p.value)}
                  style={s({
                    padding: '5px 12px',
                    fontSize: '10px',
                    borderRadius: '12px',
                    border: form.birthTime === p.value
                      ? '1px solid var(--gold-border)'
                      : '1px solid rgba(255,255,255,0.06)',
                    background: form.birthTime === p.value
                      ? 'var(--gold-subtle)'
                      : 'rgba(255,255,255,0.03)',
                    color: form.birthTime === p.value ? 'var(--gold)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={s({
            fontSize: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            maxWidth: '300px', margin: '0 auto',
            background: 'rgba(201,168,76,0.04)',
            border: '1px solid rgba(201,168,76,0.12)',
            color: 'var(--text-tertiary)', lineHeight: 1.5,
          })}>
            12:00 PM (noon) assumed. Accuracy may be reduced for time-sensitive calculations.
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={s({ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' })}>
        <button type="button" onClick={nextStep} className="btn-gold" style={s({ fontSize: '13px', padding: '10px 32px' })}>
          Next Step &rarr;
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={s({ animation: fadeIn ? 'fadeIn 0.3s ease' : 'none' })}>
      {/* City autocomplete */}
      <div ref={cityRef} style={s({ position: 'relative', marginBottom: '20px', textAlign: 'center' })}>
        <label style={s({ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em' })}>
          BIRTH LOCATION
        </label>
        <input
          type="text"
          placeholder="City, e.g. Hong Kong, London, New York"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            handleChange('location', e.target.value);
          }}
          style={s({ width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block', textAlign: 'center' })}
        />
        <p style={s({ fontSize: '10px', marginTop: '6px', color: 'var(--text-tertiary)' })}>
          For True Solar Time calculation
        </p>

        {/* City dropdown */}
        {showCityDropdown && cityResults.length > 0 && (
          <div style={s({
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '320px', zIndex: 50,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            marginTop: '4px',
            overflow: 'hidden',
          })}>
            {cityLoading && (
              <div style={s({ padding: '12px', textAlign: 'center', fontSize: '10px', color: 'var(--text-tertiary)' })}>
                Searching...
              </div>
            )}
            {!cityLoading && cityResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCitySelect(item)}
                style={s({
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  fontSize: '11px', color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: 'none', borderBottom: idx < cityResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                })}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.display}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced toggle */}
      <div style={s({ textAlign: 'center', marginBottom: '16px' })}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={s({
            background: 'none', border: 'none',
            fontSize: '10px', color: 'var(--text-tertiary)',
            cursor: 'pointer', padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.2s',
          })}
        >
          {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
          <span style={s({ display: 'inline-block', marginLeft: '4px', transition: 'transform 0.2s', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' })}>
            &#9660;
          </span>
        </button>
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div style={s({
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          flexWrap: 'wrap', maxWidth: '360px', margin: '0 auto 16px',
          padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-subtle)',
        })}>
          <div style={s({ flex: '1', minWidth: '80px' })}>
            <label style={s({ display: 'block', fontSize: '9px', marginBottom: '4px', textAlign: 'center', color: 'var(--text-quaternary)', letterSpacing: '0.03em' })}>Latitude</label>
            <input type="number" step="any" placeholder="22.319" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)}
              style={s({ width: '100%', fontSize: '11px', textAlign: 'center', padding: '8px 10px' })} />
          </div>
          <div style={s({ flex: '1', minWidth: '80px' })}>
            <label style={s({ display: 'block', fontSize: '9px', marginBottom: '4px', textAlign: 'center', color: 'var(--text-quaternary)', letterSpacing: '0.03em' })}>Longitude</label>
            <input type="number" step="any" placeholder="114.169" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)}
              style={s({ width: '100%', fontSize: '11px', textAlign: 'center', padding: '8px 10px' })} />
          </div>
          <div style={s({ flex: '1', minWidth: '80px' })}>
            <label style={s({ display: 'block', fontSize: '9px', marginBottom: '4px', textAlign: 'center', color: 'var(--text-quaternary)', letterSpacing: '0.03em' })}>TZ Offset</label>
            <input type="number" step="any" placeholder="+8" value={form.timezoneOffset} onChange={(e) => handleChange('timezoneOffset', e.target.value)}
              style={s({ width: '100%', fontSize: '11px', textAlign: 'center', padding: '8px 10px' })} />
          </div>
          <div style={s({ flex: '1', minWidth: '80px' })}>
            <label style={s({ display: 'block', fontSize: '9px', marginBottom: '4px', textAlign: 'center', color: 'var(--text-quaternary)', letterSpacing: '0.03em' })}>TZ Name</label>
            <input type="text" placeholder="Asia/Hong_Kong" value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)}
              style={s({ width: '100%', fontSize: '11px', textAlign: 'center', padding: '8px 10px' })} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={s({ display: 'flex', justifyContent: 'space-between', marginTop: '28px' })}>
        <button type="button" onClick={prevStep} className="btn-ghost" style={s({ fontSize: '13px', padding: '10px 24px' })}>
          &larr; Back
        </button>
        <button type="button" onClick={nextStep} className="btn-gold" style={s({ fontSize: '13px', padding: '10px 32px' })}>
          Next Step &rarr;
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={s({ animation: fadeIn ? 'fadeIn 0.3s ease' : 'none', textAlign: 'center' })}>
      {/* Gender */}
      <div style={s({ marginBottom: '24px' })}>
        <label style={s({ display: 'block', fontSize: '11px', marginBottom: '10px', color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em' })}>
          GENDER
        </label>
        <div style={s({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' })}>
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'non-binary', label: 'Non-binary' },
            { value: '', label: 'Prefer not to say' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange('gender', opt.value)}
              style={s({
                padding: '8px 18px', fontSize: '11px', borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s',
                background: form.gender === opt.value ? 'var(--gold-subtle)' : 'rgba(255,255,255,0.03)',
                border: form.gender === opt.value ? '1px solid var(--gold-border)' : '1px solid rgba(255,255,255,0.06)',
                color: form.gender === opt.value ? 'var(--gold)' : 'var(--text-tertiary)',
                cursor: 'pointer', fontWeight: form.gender === opt.value ? 500 : 400,
              })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Life Focus */}
      <div style={s({ marginBottom: '24px' })}>
        <label style={s({ display: 'block', fontSize: '11px', marginBottom: '10px', color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em' })}>
          LIFE FOCUS
        </label>
        <div style={s({ display: 'flex', justifyContent: 'center', gap: '6px' })}>
          {[
            { value: 'career', label: 'Career' },
            { value: 'love', label: 'Love' },
            { value: 'peace', label: 'Peace' },
            { value: 'all', label: 'All' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange('goal', opt.value)}
              style={s({
                padding: '8px 18px', fontSize: '11px', borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s',
                background: form.goal === opt.value ? 'var(--gold-subtle)' : 'rgba(255,255,255,0.03)',
                border: form.goal === opt.value ? '1px solid var(--gold-border)' : '1px solid rgba(255,255,255,0.06)',
                color: form.goal === opt.value ? 'var(--gold)' : 'var(--text-tertiary)',
                cursor: 'pointer', fontWeight: form.goal === opt.value ? 500 : 400,
              })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div style={s({
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '20px',
        textAlign: 'left',
      })}>
        <div style={s({ fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-quaternary)', marginBottom: '10px' })}>
          YOUR INPUT SUMMARY
        </div>
        <div style={s({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
            <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Birth Date</span>
            <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 })}>
              {form.birthDate ? new Date(form.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
            <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Birth Time</span>
            <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 })}>
              {form.unknownTime ? 'Unknown (noon assumed)' : (form.birthTime || '—')}
            </span>
          </div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
            <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Location</span>
            <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
              {form.location || '—'}
            </span>
          </div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
            <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Gender</span>
            <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 })}>
              {form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : 'Not specified'}
            </span>
          </div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
            <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Focus</span>
            <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 })}>
              {form.goal.charAt(0).toUpperCase() + form.goal.slice(1)}
            </span>
          </div>
          {form.timezone && (
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
              <span style={s({ fontSize: '10px', color: 'var(--text-tertiary)' })}>Timezone</span>
              <span style={s({ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 })}>
                {form.timezone} {form.timezoneOffset ? `(UTC${form.timezoneOffset >= 0 ? '+' : ''}${form.timezoneOffset})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={s({ display: 'flex', justifyContent: 'space-between', marginTop: '8px' })}>
        <button type="button" onClick={prevStep} className="btn-ghost" style={s({ fontSize: '13px', padding: '10px 24px' })}>
          &larr; Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold"
          style={s({ fontSize: '13px', padding: '10px 28px' })}
          onClick={handleSubmit}
        >
          {loading ? (
            <span style={s({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' })}>
              <span className="spinner"></span>
              Reading...
            </span>
          ) : 'Reveal My Destiny'}
        </button>
      </div>
    </div>
  );

  // ===================== MAIN RENDER =====================
  return (
    <div style={s({
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '6vh 16px 8vh',
    })}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={s({ width: '100%', maxWidth: '400px' })}>
        {/* Header */}
        <div style={s({ textAlign: 'center', marginBottom: '28px' })}>
          <div style={s({ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px', color: 'var(--text-quaternary)' })}>
            SOUL ELEMENTS
          </div>
          <h1 style={s({
            fontSize: '20px', fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          })}>
            Enter Your Birth Information
          </h1>
          <p style={s({ fontSize: '11px', marginTop: '8px', color: 'var(--text-tertiary)', lineHeight: 1.5 })}>
            The more accurate your information, the more precise your reading.
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}

          {/* Error */}
          {error && (
            <div style={s({
              marginTop: '16px', padding: '10px 14px', borderRadius: 'var(--radius-md)',
              fontSize: '11px', textAlign: 'center',
              background: 'rgba(255, 50, 50, 0.08)',
              border: '1px solid rgba(255, 50, 50, 0.2)',
              color: 'rgba(255,80,80,0.9)',
            })}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function InputPage() {
  return (
    <Suspense fallback={
      <div style={s({ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <div className="spinner"></div>
      </div>
    }>
      <InputForm />
    </Suspense>
  );
}
