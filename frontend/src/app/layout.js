'use client';

import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StarField />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

function StarField() {
  useEffect(() => {
    createStars();
  }, []);

  return null;
}

function createStars() {
  const existing = document.querySelectorAll('.star');
  existing.forEach(s => s.remove());

  // Use DocumentFragment to batch DOM operations (avoids 100 reflows)
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 30; i++) {  // Reduced from 100 to 30
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--duration', (Math.random() * 4 + 2) + 's');
    star.style.animationDelay = Math.random() * 5 + 's';
    fragment.appendChild(star);
  }
  document.body.appendChild(fragment);
}
