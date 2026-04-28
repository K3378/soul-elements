'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = '';

function InputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get('tier') === 'grandmaster' ? 'grandmaster' : 'standard';

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
    tier: initialTier,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
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

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '6vh', paddingBottom: '8vh' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#434759' }}>Soul Elements</div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enter Your Birth Information
          </h1>
          <p className="text-xs mt-2" style={{ color: '#434759', lineHeight: '1.6' }}>
            The more accurate your information, the more precise your reading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date of Birth */}
          <div className="text-center">
            <label className="block text-xs mb-2" style={{ color: '#C9A84C' }}>Date of Birth *</label>
            <input 
              type="date" value={form.birthDate} 
              onChange={(e) => handleChange('birthDate', e.target.value)} 
              onBlur={() => handleBlur('birthDate')}
              required 
              className={`w-full max-w-[240px] mx-auto ${touched.birthDate && !isValidDate ? 'field-error' : ''}`} 
              style={{ colorScheme: 'dark', textAlign: 'center' }} 
            />
            {touched.birthDate && !isValidDate && (
              <p className="text-xs mt-1" style={{ color: 'rgba(255,80,80,0.8)' }}>Please select your date of birth</p>
            )}
          </div>

          {/* Time of Birth */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <label className="text-xs" style={{ color: '#C9A84C' }}>Time of Birth</label>
              <label className="flex items-center gap-1.5 text-xs" style={{ color: '#434759', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.unknownTime} onChange={(e) => handleChange('unknownTime', e.target.checked)} />
                I don&apos;t know
              </label>
            </div>
            {!form.unknownTime ? (
              <input type="time" value={form.birthTime} onChange={(e) => handleChange('birthTime', e.target.value)} className="w-full max-w-[240px] mx-auto" style={{ colorScheme: 'dark', textAlign: 'center' }} />
            ) : (
              <div className="text-xs p-3 rounded max-w-[300px] mx-auto" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', color: '#434759' }}>
                12:00 PM (noon) assumed. Accuracy may be reduced.
              </div>
            )}
          </div>

          <div className="divider" style={{ margin: '0 auto', maxWidth: '200px' }}></div>

          {/* Location */}
          <div className="text-center">
            <label className="block text-xs mb-2" style={{ color: '#C9A84C' }}>Birth Location</label>
            <input type="text" placeholder="City, e.g. Hong Kong, London, New York" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full max-w-[300px] mx-auto text-center" />
            <p className="text-xs mt-1" style={{ color: '#434759' }}>For True Solar Time calculation</p>
          </div>

          {/* Lat / Lng / TZ in one row */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-[360px] mx-auto">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] mb-1 text-center" style={{ color: '#434759' }}>Latitude</label>
              <input type="number" step="any" placeholder="22.319" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} className="w-full text-xs text-center" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] mb-1 text-center" style={{ color: '#434759' }}>Longitude</label>
              <input type="number" step="any" placeholder="114.169" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} className="w-full text-xs text-center" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] mb-1 text-center" style={{ color: '#434759' }}>TZ Offset</label>
              <input type="number" step="any" placeholder="+8" value={form.timezoneOffset} onChange={(e) => handleChange('timezoneOffset', e.target.value)} className="w-full text-xs text-center" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] mb-1 text-center" style={{ color: '#434759' }}>TZ Name</label>
              <input type="text" placeholder="Asia/HK" value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full text-xs text-center" />
            </div>
          </div>

          <div className="divider" style={{ margin: '0 auto', maxWidth: '200px' }}></div>

          {/* Gender */}
          <div className="text-center">
            <label className="block text-xs mb-2" style={{ color: '#C9A84C' }}>Gender</label>
            <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full max-w-[200px] mx-auto text-center">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          {/* Life Focus */}
          <div className="text-center">
            <label className="block text-xs mb-2" style={{ color: '#C9A84C' }}>Life Focus</label>
            <div className="flex items-center justify-center gap-2">
              {[
                { value: 'career', label: 'Career' },
                { value: 'love', label: 'Love' },
                { value: 'peace', label: 'Peace' },
                { value: 'all', label: 'All' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => handleChange('goal', opt.value)}
                  className="px-4 py-2 rounded text-xs transition-all"
                  style={{ background: form.goal === opt.value ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.03)', border: form.goal === opt.value ? '1px solid rgba(201, 168, 76, 0.4)' : '1px solid rgba(255,255,255,0.06)', color: form.goal === opt.value ? '#C9A84C' : '#6B6F80' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded text-sm text-center max-w-[300px] mx-auto" style={{ background: 'rgba(255, 50, 50, 0.08)', border: '1px solid rgba(255, 50, 50, 0.2)', color: 'rgba(255,80,80,0.9)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="text-center pt-2">
            <button type="submit" disabled={loading} className="btn-gold px-8 py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Reading...
                </span>
              ) : 'Reveal My Destiny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InputPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <InputForm />
    </Suspense>
  );
}
