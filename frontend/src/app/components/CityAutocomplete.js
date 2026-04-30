'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const s = (styles) => styles;

export default function CityAutocomplete({ value, onChange, onCitySelect }) {
  const [cityQuery, setCityQuery] = useState(value || '');
  const [cityResults, setCityResults] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [citySelected, setCitySelected] = useState(false);
  const cityDebounce = useRef(null);
  const cityRef = useRef(null);

  // Keep local query in sync with prop
  useEffect(() => {
    setCityQuery(value || '');
    if (value) setCitySelected(true);
  }, [value]);

  // --- Debounced Nominatim search ---
  useEffect(() => {
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (cityQuery.length < 3) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    cityDebounce.current = setTimeout(async () => {
      setCityLoading(true);
      setShowCityDropdown(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=5&featureType=city`,
          { headers: { 'User-Agent': 'SoulElements/1.0' } }
        );
        const data = await res.json();
        const mapped = (data || []).map((item) => ({
          display: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
        setCityResults(mapped);
        setShowCityDropdown(true);
      } catch {
        setCityResults([]);
        setShowCityDropdown(false);
      } finally {
        setCityLoading(false);
      }
    }, 350);
  }, [cityQuery]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCityQuery(val);
    setCitySelected(false);
    onChange?.(val);
  };

  const handleSelect = useCallback((item) => {
    setCityQuery(item.display);
    setShowCityDropdown(false);
    setCitySelected(true);
    onChange?.(item.display);
    onCitySelect?.(item);
  }, [onChange, onCitySelect]);

  const showDropdown = showCityDropdown && (cityLoading || cityResults.length > 0 || cityQuery.length >= 3);

  return (
    <div ref={cityRef} style={s({ position: 'relative', marginBottom: '20px', textAlign: 'center' })}>
      <style>{`
        .city-dropdown-item:hover {
          background: var(--gold-subtle) !important;
        }
        .city-dropdown-item:last-child {
          border-bottom: none !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <label
        style={s({
          display: 'block', fontSize: '11px', marginBottom: '8px',
          color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.03em',
        })}
      >
        BIRTH LOCATION
      </label>
      <input
        type="text"
        placeholder="City, e.g. Hong Kong, London, New York"
        value={cityQuery}
        onChange={handleInputChange}
        style={s({
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          display: 'block',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid ' + (citySelected ? 'var(--gold-border)' : 'var(--border-default)'),
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '14px',
          color: 'var(--text-primary)',
        })}
      />
      <p style={s({ fontSize: '10px', marginTop: '6px', color: 'var(--text-tertiary)' })}>
        For True Solar Time calculation
      </p>

      {showDropdown && (
        <div
          style={s({
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '300px', zIndex: 50,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            marginTop: '4px',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          })}
        >
          {cityLoading && (
            <div style={s({ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)' })}>
              Searching...
            </div>
          )}
          {!cityLoading && cityResults.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="city-dropdown-item"
              onClick={() => handleSelect(item)}
              style={s({
                width: '100%', textAlign: 'left', padding: '10px 14px',
                fontSize: '12px', color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              })}
            >
              {item.display}
            </button>
          ))}
          {!cityLoading && cityResults.length === 0 && cityQuery.length >= 3 && (
            <div style={s({ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)' })}>
              No cities found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
