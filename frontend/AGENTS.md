<!-- BEGIN:nextjs-agent-rules -->
# Soul Elements - Frontend

BaZi fortune telling web app. Dark theme, all English content.
Live at: stemssouls.up.railway.app

## Tech
- Next.js (app directory)
- React
- CSS (globals.css)

## Pages
- `/` — Landing page
- `/input` — Birth info form (date, time, location)
- `/preview` — Report preview before Stripe payment
- `/report` — Full report with PDF download button
- `/success` — Stripe payment success

## Design Tokens
- BG: #07080A (near-black)
- Gold accent: #C9A84C
- Blue accent: #3B82F6
- Font: text-base minimum for body
- Tai Chi image (bg-design.jpg) at ~0.2 opacity
- Ref: Dante Calculator Pro style (blue #3498DB, dark #0D1117)

## Components
- `ElementRadarChart` — Element scoring radar visualization
- `FortuneStickOracle` — 60 sticks oracle feature

## Backend API endpoints
- POST /api/analyze — Calculate BaZi
- POST /api/report/generate-pdf — Generate PDF
- GET /api/report/:sessionId/pdf — Download PDF
- POST /api/create-payment-intent — Stripe

## Notes
- PDF generation is server-side (PDFKit), not browser print
- Location uses Nominatim for geocoding, UTC modal picker for timezone
- Email delivery is skipped for v1
- All content in English only (no Chinese characters)
- See `.windsurfrules` in project root for full context
<!-- END:nextjs-agent-rules -->
