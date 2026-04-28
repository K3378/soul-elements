'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = '';

export default function HomePage() {
  const router = useRouter();

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [showForm, setShowForm] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValidDate = form.birthDate && form.birthDate.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          timezoneOffset: form.timezoneOffset ? parseInt(form.timezoneOffset) : null,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '6vh' }}>
      {/* Header */}
      <div className="text-center mb-10 max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5" style={{ background: 'var(--gold-subtle)' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A54A" strokeWidth="1.5" opacity="0.5" />
            <path d="M50 4 A46 46 0 0 1 50 50 A23 23 0 0 0 50 96 A46 46 0 0 1 50 4" fill="#D4A54A" opacity="0.75" />
            <circle cx="50" cy="73" r="7" fill="#07070D" />
            <circle cx="50" cy="27" r="7" fill="#D4A54A" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
          Discover Your<br />
          <span style={{ color: 'var(--gold)' }}>Soul Element</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Ancient Chinese wisdom meets modern self-discovery. Enter your birth details below to unlock your Four Pillars of Destiny.
        </p>
      </div>

      {/* CTA / Form Toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="btn-gold px-10 py-3 mb-10">
          Begin Your Journey
        </button>
      ) : null}

      {/* Input Form */}
      {showForm && (
        <div className="w-full max-w-md mb-12" style={{ animation: 'fadeIn 0.4s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="text-center mb-1">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--gold)' }}>Date of Birth *</label>
              <input type="date" value={form.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, birthDate: true }))}
                required
                className={`w-full max-w-[220px] mx-auto text-center ${touched.birthDate && !isValidDate ? 'field-error' : ''}`}
                style={{ colorScheme: 'dark' }} />
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-1.5">
                <label className="text-xs" style={{ color: 'var(--gold)' }}>Time of Birth</label>
                <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.unknownTime} onChange={e => handleChange('unknownTime', e.target.checked)} />
                  Unknown
                </label>
              </div>
              {!form.unknownTime ? (
                <input type="time" value={form.birthTime} onChange={e => handleChange('birthTime', e.target.value)}
                  className="w-full max-w-[220px] mx-auto text-center" style={{ colorScheme: 'dark' }} />
              ) : (
                <div className="text-xs p-2.5 rounded max-w-[280px] mx-auto" style={{ background: 'var(--gold-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Noon (12:00 PM) assumed. Accuracy may be reduced.
                </div>
              )}
            </div>

            <div className="divider max-w-[160px] mx-auto !my-5"></div>

            {/* Location */}
            <div className="text-center">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--gold)' }}>Birth Location</label>
              <input type="text" placeholder="City, e.g. Hong Kong, London, New York"
                value={form.location} onChange={e => handleChange('location', e.target.value)}
                className="w-full max-w-[300px] mx-auto text-center text-sm" />
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>Used for True Solar Time accuracy</p>
            </div>

            {/* Coordinates */}
            <div className="flex items-start justify-center gap-2 max-w-[380px] mx-auto">
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>Lat</label>
                <input type="number" step="any" placeholder="22.319" value={form.latitude}
                  onChange={e => handleChange('latitude', e.target.value)} className="w-full text-xs text-center" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>Lng</label>
                <input type="number" step="any" placeholder="114.169" value={form.longitude}
                  onChange={e => handleChange('longitude', e.target.value)} className="w-full text-xs text-center" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>TZ</label>
                <input type="number" step="any" placeholder="+8" value={form.timezoneOffset}
                  onChange={e => handleChange('timezoneOffset', e.target.value)} className="w-full text-xs text-center" />
              </div>
            </div>

            <div className="divider max-w-[160px] mx-auto !my-5"></div>

            {/* Gender */}
            <div className="text-center">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--gold)' }}>Gender</label>
              <select value={form.gender} onChange={e => handleChange('gender', e.target.value)}
                className="w-full max-w-[180px] mx-auto text-center text-sm">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Focus */}
            <div className="text-center">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--gold)' }}>Life Focus</label>
              <div className="flex items-center justify-center gap-2">
                {[
                  { value: 'career', label: 'Career' },
                  { value: 'love', label: 'Love' },
                  { value: 'peace', label: 'Peace' },
                  { value: 'all', label: 'All' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => handleChange('goal', opt.value)}
                    className="px-3.5 py-2 rounded text-xs transition-all"
                    style={{
                      background: form.goal === opt.value ? 'var(--gold-subtle)' : 'rgba(255,255,255,0.03)',
                      border: form.goal === opt.value ? '1px solid var(--border-light)' : '1px solid transparent',
                      color: form.goal === opt.value ? 'var(--gold)' : 'var(--text-muted)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded text-sm text-center max-w-[300px] mx-auto" style={{ background: 'rgba(224,88,88,0.08)', border: '1px solid rgba(224,88,88,0.2)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="text-center pt-3">
              <button type="submit" disabled={loading} className="btn-gold px-10 py-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Reading the stars...
                  </span>
                ) : 'Reveal My Destiny'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Features - always visible */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-16">
          {[
            { icon: '☯', title: 'Four Pillars', text: 'Discover your Year, Month, Day, and Hour Pillars based on your exact birth time and location.' },
            { icon: '✦', title: 'Five Elements', text: 'Understand the cosmic balance of Wood, Fire, Earth, Metal, and Water within you.' },
            { icon: '♾', title: 'Life Guidance', text: 'Personalized insights into your career, relationships, and life path.' },
          ].map(f => (
            <div key={f.title} className="text-center p-5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xl mb-2" style={{ color: 'var(--gold)', opacity: 0.6 }}>{f.icon}</div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] mb-8" style={{ color: 'var(--text-dim)' }}>
        Soul Elements &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
