'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = '';

// TZ list for reference
const COMMON_TZ = [
  { name: 'Asia/Hong_Kong', offset: 8, label: 'Hong Kong (UTC+8)' },
  { name: 'Asia/Shanghai', offset: 8, label: 'China (UTC+8)' },
  { name: 'Asia/Taipei', offset: 8, label: 'Taiwan (UTC+8)' },
  { name: 'Asia/Singapore', offset: 8, label: 'Singapore (UTC+8)' },
  { name: 'Asia/Tokyo', offset: 9, label: 'Japan (UTC+9)' },
  { name: 'Asia/Seoul', offset: 9, label: 'Korea (UTC+9)' },
  { name: 'America/New_York', offset: -5, label: 'New York (UTC-5)' },
  { name: 'America/Los_Angeles', offset: -8, label: 'California (UTC-8)' },
  { name: 'America/Chicago', offset: -6, label: 'Chicago (UTC-6)' },
  { name: 'Europe/London', offset: 0, label: 'London (UTC+0)' },
  { name: 'Europe/Paris', offset: 1, label: 'Paris (UTC+1)' },
  { name: 'Australia/Sydney', offset: 11, label: 'Sydney (UTC+11)' },
  { name: 'Pacific/Auckland', offset: 13, label: 'Auckland (UTC+13)' },
  { name: 'Asia/Dubai', offset: 4, label: 'Dubai (UTC+4)' },
  { name: 'Asia/Kolkata', offset: 5.5, label: 'India (UTC+5:30)' },
];

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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [tstBadge, setTstBadge] = useState(null);
  const [themeElement, setThemeElement] = useState(null);
  const [tzAutoDetected, setTzAutoDetected] = useState(false);
  const [tzManual, setTzManual] = useState(false);

  // Auto-detect browser timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const found = COMMON_TZ.find(t => t.name === tz);
      if (found) {
        setForm(prev => ({
          ...prev,
          timezone: found.name,
          timezoneOffset: String(found.offset),
        }));
        setTzAutoDetected(true);
      }
    } catch (e) {}
  }, []);

  // Debounced location search via Nominatim
  const searchLocation = useCallback(async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setLocationSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await res.json();
      setLocationSuggestions(data.map(d => ({
        display: d.display_name,
        lat: d.lat,
        lon: d.lon,
        type: d.type,
      })));
    } catch (e) {
      setLocationSuggestions([]);
    } finally {
      setLocationSearching(false);
    }
  }, []);

  let searchTimer;
  const handleLocationInput = (value) => {
    setForm(prev => ({ ...prev, location: value }));
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchLocation(value), 400);
  };

  const selectLocation = (loc) => {
    setForm(prev => ({
      ...prev,
      location: loc.display,
      latitude: loc.lat,
      longitude: loc.lon,
    }));
    setLocationSuggestions([]);
    setTouched(prev => ({ ...prev, location: true, latitude: true, longitude: true }));
    updateTstBadge(parseFloat(loc.lon), parseFloat(form.timezoneOffset));
  };

  // Auto-detect timezone from coordinates if not already set
  const selectLocationAndTz = async (loc) => {
    // First set coordinates and location
    setForm(prev => ({
      ...prev,
      location: loc.display,
      latitude: loc.lat,
      longitude: loc.lon,
    }));
    setLocationSuggestions([]);
    setTouched(prev => ({ ...prev, location: true, latitude: true, longitude: true }));

    // Try to detect timezone from coordinates using reverse geocoding + timezone API
    // Fallback: use Intl tz or let user pick
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}&zoom=10`
      );
      const data = await res.json();
      // Use the address to infer timezone roughly
      // For precise TZ detection we'd use the Google Time Zone API or geonames
      // Fallback: check common TZs
      const country = data?.address?.country_code?.toLowerCase() || '';
      const state = data?.address?.state || '';
      
      // Rough mapping for common countries
      const tzMap = {
        hk: { name: 'Asia/Hong_Kong', offset: 8 },
        cn: { name: 'Asia/Shanghai', offset: 8 },
        sg: { name: 'Asia/Singapore', offset: 8 },
        jp: { name: 'Asia/Tokyo', offset: 9 },
        kr: { name: 'Asia/Seoul', offset: 9 },
        gb: { name: 'Europe/London', offset: 0 },
        fr: { name: 'Europe/Paris', offset: 1 },
        de: { name: 'Europe/Berlin', offset: 1 },
        au: { name: 'Australia/Sydney', offset: 11 },
        nz: { name: 'Pacific/Auckland', offset: 13 },
        ae: { name: 'Asia/Dubai', offset: 4 },
        in: { name: 'Asia/Kolkata', offset: 5.5 },
        tw: { name: 'Asia/Taipei', offset: 8 },
        us: state?.includes('New York') ? { name: 'America/New_York', offset: -5 }
           : state?.includes('California') ? { name: 'America/Los_Angeles', offset: -8 }
           : state?.includes('Illinois') || state?.includes('Chicago') ? { name: 'America/Chicago', offset: -6 }
           : state?.includes('Texas') ? { name: 'America/Chicago', offset: -6 }
           : null,
      };
      const guessed = tzMap[country];
      if (guessed) {
        setForm(prev => ({
          ...prev,
          timezone: guessed.name,
          timezoneOffset: String(guessed.offset),
        }));
        setTzAutoDetected(true);
        updateTstBadge(parseFloat(loc.lon), guessed.offset);
      } else {
        // Use browser tz as fallback
        try {
          const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setForm(prev => ({ ...prev, timezone: browserTz }));
        } catch (e) {}
        updateTstBadge(parseFloat(loc.lon), parseFloat(form.timezoneOffset) || 0);
      }
    } catch (e) {
      updateTstBadge(parseFloat(loc.lon), parseFloat(form.timezoneOffset) || 0);
    }
  };

  const updateTstBadge = (lon, tzOffset) => {
    if (lon && tzOffset) {
      const tzMeridian = tzOffset * 15;
      const lonDiff = lon - tzMeridian;
      const tstDiff = lonDiff * 4; // 4 min per degree
      const absDiff = Math.abs(tstDiff);
      const direction = tstDiff >= 0 ? 'ahead of' : 'behind';
      if (absDiff > 0.5) {
        setTstBadge({
          text: `Location adjusted by ${Math.round(absDiff)} min (${direction} local time) for True Solar Time accuracy`,
          type: 'adjusted',
        });
      } else {
        setTstBadge({
          text: 'Location is aligned with timezone meridian — no adjustment needed',
          type: 'aligned',
        });
      }
    } else {
      setTstBadge(null);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Update TST badge when timezone or manual lat/lon changes
    if (field === 'longitude' || field === 'timezoneOffset') {
      const lon = field === 'longitude' ? parseFloat(value) : parseFloat(form.longitude);
      const off = field === 'timezoneOffset' ? parseFloat(value) : parseFloat(form.timezoneOffset);
      if (!isNaN(lon) && !isNaN(off)) {
        updateTstBadge(lon, off);
      }
    }
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
          timezoneOffset: form.timezoneOffset ? parseFloat(form.timezoneOffset) : null,
          timezone: form.timezone || null,
          gender: form.gender || null,
          goal: form.goal || 'all',
          unknownTime: form.unknownTime,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      // Set theme element from Day Master
      if (data?.bazi?.dayMaster?.element) {
        setThemeElement(data.bazi.dayMaster.element);
      }

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

            {/* Location with Autocomplete */}
            <div className="text-center">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--gold)' }}>Birth Location</label>
              <div className="relative max-w-[320px] mx-auto">
                <input type="text" placeholder="Search city, e.g. Hong Kong, London..."
                  value={form.location}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  className="w-full text-center text-sm" />
                
                {/* Suggestions dropdown */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-0.5 z-10 text-left rounded-lg overflow-hidden"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto' }}>
                    {locationSuggestions.map((loc, i) => (
                      <button key={i} type="button" onClick={() => selectLocationAndTz(loc)}
                        className="w-full text-xs text-left px-3 py-2.5 transition-colors hover:bg-white/5"
                        style={{ color: 'var(--text-secondary)', borderBottom: i < locationSuggestions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {loc.display.split(',')[0]}, {loc.display.split(',').slice(1, 3).join(',')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>Used for True Solar Time accuracy</p>
              
              {/* TST Badge */}
              {tstBadge && (
                <div className={`inline-flex items-center gap-1.5 text-[10px] mt-1.5 px-2.5 py-1 rounded-full`}
                  style={{ 
                    background: tstBadge.type === 'adjusted' ? 'rgba(212,165,74,0.08)' : 'rgba(88,184,107,0.08)', 
                    border: `1px solid ${tstBadge.type === 'adjusted' ? 'rgba(212,165,74,0.2)' : 'rgba(88,184,107,0.2)'}`,
                    color: tstBadge.type === 'adjusted' ? 'var(--gold)' : 'var(--success)',
                  }}>
                  <span>{tstBadge.type === 'adjusted' ? '⏱' : '✓'}</span>
                  <span>{tstBadge.text}</span>
                </div>
              )}
            </div>

            {/* Lat / Lng (auto-filled) */}
            <div className="flex items-center justify-center gap-2 max-w-[340px] mx-auto">
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>Latitude</label>
                <input type="number" step="any" placeholder="Auto" value={form.latitude}
                  onChange={e => handleChange('latitude', e.target.value)}
                  className="w-full text-xs text-center" readOnly={!!form.latitude && form.location.length > 3} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>Longitude</label>
                <input type="number" step="any" placeholder="Auto" value={form.longitude}
                  onChange={e => handleChange('longitude', e.target.value)}
                  className="w-full text-xs text-center" readOnly={!!form.longitude && form.location.length > 3} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] mb-1 text-center" style={{ color: 'var(--text-dim)' }}>TZ Offset</label>
                <input type="number" step="any" placeholder="Auto" value={form.timezoneOffset}
                  onChange={e => handleChange('timezoneOffset', e.target.value)}
                  className="w-full text-xs text-center" />
              </div>
            </div>

            {/* Timezone Selector */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <select value={form.timezone} onChange={e => {
                  const tz = COMMON_TZ.find(t => t.name === e.target.value);
                  if (tz) {
                    setForm(prev => ({ ...prev, timezone: tz.name, timezoneOffset: String(tz.offset) }));
                    const lon = parseFloat(form.longitude);
                    if (!isNaN(lon)) updateTstBadge(lon, tz.offset);
                  }
                }}
                  className="text-xs text-center max-w-[220px]"
                  style={{ padding: '8px 12px' }}>
                  <option value="">Timezone (auto-detected)</option>
                  {COMMON_TZ.map(tz => (
                    <option key={tz.name} value={tz.name}>
                      {tz.label} {tzAutoDetected && form.timezone === tz.name ? '(auto)' : ''}
                    </option>
                  ))}
                </select>
                {tzAutoDetected && (
                  <span className="text-[10px]" style={{ color: 'var(--success)' }}>✓ Detected</span>
                )}
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
