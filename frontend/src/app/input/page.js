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
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enter Your Birth Information
          </h1>
          <p className="text-xs mt-1" style={{ color: '#434759' }}>
            All fields marked * are required. The rest help improve accuracy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Birth Date & Time */}
          <div className="card-glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#434759' }}>Birth Date &amp; Time</div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#C9A84C' }}>Date of Birth *</label>
                <input 
                  type="date" value={form.birthDate} 
                  onChange={(e) => handleChange('birthDate', e.target.value)} 
                  onBlur={() => handleBlur('birthDate')}
                  required 
                  className={`w-full ${touched.birthDate && !isValidDate ? 'field-error' : ''}`} 
                  style={{ colorScheme: 'dark' }} 
                />
                {touched.birthDate && !isValidDate && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,80,80,0.8)' }}>Date of birth is required</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs" style={{ color: '#C9A84C' }}>Time of Birth</label>
                  <label className="flex items-center gap-1.5 text-xs" style={{ color: '#434759', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.unknownTime} onChange={(e) => handleChange('unknownTime', e.target.checked)} />
                    Unknown
                  </label>
                </div>
                {!form.unknownTime ? (
                  <input type="time" value={form.birthTime} onChange={(e) => handleChange('birthTime', e.target.value)} className="w-full" style={{ colorScheme: 'dark' }} />
                ) : (
                  <div className="text-xs p-2 rounded" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', color: '#434759' }}>
                    Using 12:00 PM (noon) as default. Accuracy may be reduced.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="card-glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#434759' }}>Birth Location</div>
            
            <div className="space-y-3">
              <div>
                <input type="text" placeholder="City (e.g. Hong Kong, London, New York)" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full" />
                <p className="text-xs mt-1" style={{ color: '#434759' }}>Used to calculate True Solar Time for maximum accuracy.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#434759' }}>Latitude</label>
                  <input type="number" step="any" placeholder="22.3193" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} className="w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#434759' }}>Longitude</label>
                  <input type="number" step="any" placeholder="114.1694" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} className="w-full text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#434759' }}>Timezone Offset</label>
                  <input type="number" step="any" placeholder="e.g. 8" value={form.timezoneOffset} onChange={(e) => handleChange('timezoneOffset', e.target.value)} className="w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#434759' }}>Timezone Name</label>
                  <input type="text" placeholder="Asia/Hong_Kong" value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Personal Info */}
          <div className="card-glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#434759' }}>Personal Details</div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#C9A84C' }}>Gender</label>
                <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#C9A84C' }}>Life Focus</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'career', label: 'Career' },
                    { value: 'love', label: 'Love' },
                    { value: 'peace', label: 'Peace' },
                    { value: 'all', label: 'All' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => handleChange('goal', opt.value)}
                      className="p-2 rounded text-xs text-center transition-all"
                      style={{ background: form.goal === opt.value ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.03)', border: form.goal === opt.value ? '1px solid rgba(201, 168, 76, 0.4)' : '1px solid rgba(255,255,255,0.06)', color: form.goal === opt.value ? '#C9A84C' : '#6B6F80' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded text-sm" style={{ background: 'rgba(255, 50, 50, 0.08)', border: '1px solid rgba(255, 50, 50, 0.2)', color: 'rgba(255,80,80,0.9)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-gold w-full py-3 mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Reading the cosmos...
              </span>
            ) : 'Reveal My Destiny'}
          </button>
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
