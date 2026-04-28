import './globals.css';

export const metadata = {
  title: 'Soul Elements | Ba Zi Four Pillars Destiny Reading — Discover Your True Nature',
  description: 'Unlock the wisdom of the Four Pillars of Destiny (Ba Zi). Get your personalized Ba Zi chart with Day Master analysis, Five Elements balance, hidden stems, ten deities, and 10-year luck cycles. Ancient Chinese metaphysics for modern self-discovery.',
  keywords: 'Ba Zi, Four Pillars, Chinese astrology, Five Elements, destiny reading, Day Master, Zi Ping Ba Zi, soul elements, Chinese metaphysics',
  openGraph: {
    title: 'Soul Elements — Ba Zi Four Pillars Destiny Reading',
    description: 'A 2,500-year-old system for understanding your true nature. Ancient Chinese metaphysics meets modern self-discovery.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
