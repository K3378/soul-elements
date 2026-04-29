# Soul Elements

BaZi (Four Pillars) fortune telling website. Dark theme, all English.

## Tech
- Frontend: Next.js (app dir)
- Backend: Express.js
- PDF: PDFKit
- Hosting: Railway
- Payments: Stripe

## Design
- BG: #07080A, Gold: #C9A84C, Blue: #3B82F6
- Tai Chi bg image at 0.2-0.25 opacity
- text-base minimum for body text
- All English, no Chinese characters

## Structure
- `/frontend/src/app/` — pages (page.js, input/, preview/, report/, success/)
- `/frontend/src/app/components/` — ElementRadarChart, FortuneStickOracle
- `/backend/` — Express API (server.js, routes/, lib/core/, lib/pdf/)
- See `.windsurfrules` for full details
