'use client';

/**
 * ElementRadarChart — SVG-based 5-element radar/spider chart
 * Pure React, no D3 dependency needed
 * 
 * Shows the distribution of Wood, Fire, Earth, Metal, Water
 * with animated fill and labels.
 */

import { useState, useEffect } from 'react';

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ELEMENT_COLORS = {
  Wood: '#4CAF50',
  Fire: '#FF7043',
  Earth: '#CDA76D',
  Metal: '#B0A8A0',
  Water: '#42A5F5',
};
const ELEMENT_ICONS = {
  Wood: '🌲',
  Fire: '🔥',
  Earth: '🌍',
  Metal: '⚔️',
  Water: '🌊',
};

export default function ElementRadarChart({ percentages = {}, size = 300, animated = true }) {
  const [progress, setProgress] = useState(animated ? 0 : 1);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const levels = 5; // concentric rings

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setProgress(1), 200);
    return () => clearTimeout(timer);
  }, [animated]);

  // Calculate polygon points for each element based on its percentage
  const getPoint = (index, total, value) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2; // start from top
    const r = (value / 100) * radius * progress;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Calculate outer point (100%) for grid
  const getOuterPoint = (index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Build data polygon points
  const dataPoints = ELEMENTS.map((elem, i) => {
    const pct = percentages[elem] || 0;
    return getPoint(i, ELEMENTS.length, pct);
  });

  // Build data polygon path
  const dataPath = dataPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Build grid rings (concentric)
  const gridRings = [];
  for (let level = 1; level <= levels; level++) {
    const r = (radius * level) / levels * progress;
    const points = ELEMENTS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / ELEMENTS.length - Math.PI / 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    const path = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z';
    gridRings.push(path);
  }

  // Label positions (outside the chart)
  const labels = ELEMENTS.map((elem, i) => {
    const outer = getOuterPoint(i, ELEMENTS.length);
    // Offset label further out
    const labelR = radius * 1.28;
    const angle = (Math.PI * 2 * i) / ELEMENTS.length - Math.PI / 2;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      elem,
      pct: percentages[elem] || 0,
      color: ELEMENT_COLORS[elem],
      icon: ELEMENT_ICONS[elem],
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar-chart">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,165,74,0.15)" />
          <stop offset="100%" stopColor="rgba(212,165,74,0.02)" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {gridRings.map((path, i) => (
        <path key={i}
          d={path}
          fill="none"
          stroke="rgba(212,165,74,0.08)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines from center to each element */}
      {ELEMENTS.map((_, i) => {
        const outer = getOuterPoint(i, ELEMENTS.length);
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="rgba(212,165,74,0.06)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data area */}
      <path
        d={dataPath}
        fill="url(#radarFill)"
        stroke="#D4A54A"
        strokeWidth={1.5}
        style={{ transition: 'all 0.8s ease' }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i}
          cx={p.x} cy={p.y}
          r={3}
          fill={ELEMENT_COLORS[ELEMENTS[i]]}
          stroke="#D4A54A"
          strokeWidth={0.5}
        />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <g key={i}>
          <text
            x={l.x}
            y={l.y - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={l.color}
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fontWeight={600}
            opacity={0.9}
          >
            {l.icon} {l.elem}
          </text>
          <text
            x={l.x}
            y={l.y + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#D4A54A"
            fontSize={11}
            fontFamily="Playfair Display, serif"
            fontWeight={700}
          >
            {l.pct}%
          </text>
        </g>
      ))}
    </svg>
  );
}
