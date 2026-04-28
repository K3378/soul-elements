'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.birthDate) {
      setError('Please enter your date of birth.');
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

      router.push(`/preview/${data.reportId}?data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 fade-in-up">
          <div className="tai-chi-spin mb-4">
            <svg width="50" height="50" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
              <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
              <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
              <circle cx="50" cy="26" r="8" fill="#C9A84C" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enter Your Birth Information
          </h1>
          <p className="text-sm mt-2" style={{ color: '#8B8FA3' }}>
            The more accurate your information, the more precise your reading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#C9A84C' }}>Date of Birth *</label>
            <input type="date" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} required className="w-full" style={{ colorScheme: 'dark' }} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#C9A84C' }}>Time of Birth</label>
              <label className="flex items-center gap-2 text-xs" style={{ color: '#8B8FA3' }}>
                <input type="checkbox" checked={form.unknownTime} onChange={(e) => handleChange('unknownTime', e.target.checked)} />
                I don&apos;t know my exact time
              </label>
            </div>
            {!form.unknownTime ? (
              <input type="time" value={form.birthTime} onChange={(e) => handleChange('birthTime', e.target.value)} className="w-full" style={{ colorScheme: 'dark' }} />
            ) : (
              <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.3)', color: '#E8D48B' }}>
                ⚠ Without your exact birth time, accuracy will be reduced. We will use 12:00 PM (noon) as default.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#C9A84C' }}>Birth Location</label>
            <input type="text" placeholder="e.g. Hong Kong, London, New York..." value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#8B8FA3' }}>Used to calculate your True Solar Time.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8B8FA3' }}>Latitude</label>
              <input type="number" step="any" placeholder="22.3193" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8B8FA3' }}>Longitude</label>
              <input type="number" step="any" placeholder="114.1694" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} className="w-full text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8B8FA3' }}>Timezone Offset (e.g. 8)</label>
              <input type="number" step="any" placeholder="8" value={form.timezoneOffset} onChange={(e) => handleChange('timezoneOffset', e.target.value)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8B8FA3' }}>Timezone Name</label>
              <input type="text" placeholder="Asia/Hong_Kong" value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#C9A84C' }}>Gender</label>
            <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#C9A84C' }}>Life Focus</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'career', label: '💼 Career' },
                { value: 'love', label: '❤️ Love' },
                { value: 'peace', label: '☮️ Peace' },
                { value: 'all', label: '🌟 All' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => handleChange('goal', opt.value)}
                  className="p-3 rounded-lg text-left transition-all text-sm"
                  style={{ background: form.goal === opt.value ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255,255,255,0.03)', border: form.goal === opt.value ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#FF6B6B' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full text-lg py-4 mt-4">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin"></span>
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
        <div className="tai-chi-spin">
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
            <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
            <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
            <circle cx="50" cy="26" r="8" fill="#C9A84C" />
          </svg>
        </div>
      </div>
    }>
      <InputForm />
    </Suspense>
  );
}
