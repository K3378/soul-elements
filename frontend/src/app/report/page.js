'use client';

import { Suspense } from 'react';

function ReportContent() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-4xl">
        {/* Loading Simulation */}
        <div className="text-center mb-12 fade-in-up">
          <div className="tai-chi-spin mb-6">
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A84C" strokeWidth="2" />
              <path d="M50 2 A48 48 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2" fill="#C9A84C" opacity="0.9" />
              <circle cx="50" cy="74" r="8" fill="#0B0E1A" />
              <circle cx="50" cy="26" r="8" fill="#C9A84C" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reading Your Cosmic Map...
          </h1>
          <p className="text-sm" style={{ color: '#8B8FA3' }}>
            Your personalized destiny report is being prepared.
          </p>
        </div>

        {/* Full Report Area - Placeholder */}
        <div className="space-y-6">
          <div className="card-glass fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Your Soul Element: The Sharpened Sword
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#8B8FA3' }}>
              As a Yang Metal person, you embody the essence of The Sharpened Sword — 
              decisive, loyal, and strong-willed. Your presence commands respect, and your 
              integrity is the foundation of everything you build...
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#8B8FA3' }}>
              Yang Metal individuals are natural leaders who thrive on structure and clarity. 
              You have an innate ability to cut through confusion and make decisions with 
              precision. Your strength lies in your unwavering principles and your commitment 
              to justice...
            </p>
          </div>

          <div className="card-glass fade-in-up" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Your Cosmic Energy Balance
            </h2>
            {/* Energy distribution bars */}
            {[
              { name: 'Wood', pct: 0, desc: 'Growth & Vitality' },
              { name: 'Fire', pct: 25, desc: 'Expression & Passion' },
              { name: 'Earth', pct: 25, desc: 'Grounding & Trust' },
              { name: 'Metal', pct: 38, desc: 'Structure & Precision' },
              { name: 'Water', pct: 13, desc: 'Wisdom & Intuition' },
            ].map(el => (
              <div key={el.name} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ fontFamily: "'Playfair Display', serif" }}>{el.name}</span>
                  <span className="text-xs" style={{ color: '#8B8FA3' }}>{el.desc}</span>
                  <span style={{ color: '#C9A84C' }}>{el.pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: `${el.pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8D48B)' }} />
                </div>
              </div>
            ))}
            <p className="text-xs mt-4" style={{ color: '#8B8FA3' }}>
              Your Metal element dominates, giving you exceptional clarity and structure.
              The balance of Fire and Earth provides warmth and stability.
            </p>
          </div>

          {/* Download button */}
          <div className="text-center mt-10 mb-20 fade-in-up" style={{ animationDelay: '1s' }}>
            <button className="btn-gold px-10 py-4">
              Download Full PDF Report
            </button>
            <p className="text-xs mt-3" style={{ color: '#8B8FA3' }}>
              Your report is also available for viewing anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
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
      <ReportContent />
    </Suspense>
  );
}
