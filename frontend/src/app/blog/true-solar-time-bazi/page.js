'use client';

import Link from 'next/link';

export default function TrueSolarTimeArticle() {
  return (
    <div className="min-h-screen" style={{ background: '#07080A' }}>
      {/* Tai Chi Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/bg-design.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.2,
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '6vh', paddingBottom: '8vh' }}>
        <div className="w-full max-w-3xl">
          {/* Back link */}
          <div className="mb-8">
            <Link href="/blog"
              className="inline-flex items-center gap-1.5 text-sm"
              style={{ color: 'rgba(247,248,248,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(247,248,248,0.5)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>

          {/* Meta bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs" style={{ color: 'rgba(247,248,248,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
              April 30, 2026
            </span>
            <span className="text-xs" style={{ color: 'rgba(247,248,248,0.25)' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(247,248,248,0.4)', fontSize: '11px' }}>
              12 min read
            </span>
            <span className="text-xs" style={{ color: 'rgba(247,248,248,0.25)' }}>·</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '10px' }}>
              Technical
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: '10px' }}>
              Ba Zi Accuracy
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: '#F7F8F8', lineHeight: '1.15', letterSpacing: '-0.01em' }}>
            True Solar Time in Ba Zi: Why Your Birth Time Probably Needs Adjustment
          </h1>

          {/* Subtitle */}
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(247,248,248,0.6)', lineHeight: '1.6', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '18px' }}>
            Most Ba Zi calculators use standard clock time — but your birth moment is defined by the sun&apos;s actual position, not a political time zone boundary. Here&apos;s why sub-30-second True Solar Time precision matters for accurate Four Pillars calculation, and how Soul Elements gets it right.
          </p>

          {/* Decorative divider */}
          <div className="mb-10" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }} />

          {/* Article body */}
          <div className="space-y-8" style={{ color: 'rgba(247,248,248,0.78)', lineHeight: '1.85', fontSize: '15px' }}>

            {/* === Introduction === */}
            <section>
              <p className="mb-6">
                In the spring of 1912, delegates from twenty-five nations gathered in Paris for the International Meridian Conference — or rather, the second one. The first, held in Washington D.C. in 1884, had established Greenwich as the prime meridian and divided the world into twenty-four time zones, each spanning fifteen degrees of longitude. It was a triumph of industrial-era standardization: railroads could publish accurate schedules, telegraph networks could synchronize transmissions, and global commerce could proceed on a uniform temporal grid.
              </p>
              <p className="mb-6">
                What the delegates did not foresee — could not have foreseen — is that a century later, thousands of people would use those same political time zones to calculate their Ba Zi (Four Pillars of Destiny) charts. And that this well-intentioned standardization would, for millions of people born far from their time zone&apos;s central meridian, introduce errors of thirty minutes or more into the most fundamental calculation in Chinese metaphysics: the determination of the solar hour pillar.
              </p>
              <p className="mb-6">
                This is the problem that <strong style={{ color: '#F7F8F8' }}>True Solar Time (TST)</strong> solves. And this is why Soul Elements invests in sub-30-second TST precision — a level of accuracy few Ba Zi tools on the market even attempt.
              </p>
            </section>

            {/* === What is True Solar Time? === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                1. What Is True Solar Time?
              </h2>

              <p className="mb-4">
                True Solar Time, also called <strong style={{ color: '#F7F8F8' }}>apparent solar time</strong> or <strong style={{ color: '#F7F8F8' }}>local apparent time</strong>, is time measured directly by the sun&apos;s position in the sky. Noon by True Solar Time is the moment when the sun crosses the local meridian — when it reaches its highest point in the sky as observed from your exact location on Earth. The shadows are shortest. The sun is due south (in the northern hemisphere) or due north (in the southern).
              </p>

              <p className="mb-4">
                This was the only kind of time humanity knew for most of its existence. Before the advent of mechanical clocks and standardized time zones, every village set its clocks by the sundial. When the sun was directly overhead, it was noon. This is the time that the Chinese astronomical tradition has used for millennia to calculate the Shi Chen (the twelve two-hour periods that structure the Day Pillar and Hour Pillar in Ba Zi).
              </p>

              <div style={{
                background: 'rgba(15,17,17,0.95)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: '8px',
                padding: '20px 24px',
                margin: '20px 0',
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '0.05em' }}>
                  KEY DEFINITION
                </p>
                <p className="text-sm" style={{ color: 'rgba(247,248,248,0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                  <strong style={{ color: '#F7F8F8' }}>True Solar Time</strong>: The local time determined by the sun&apos;s actual position relative to a specific geographic longitude. It differs from standard clock time by an amount that depends on how far east or west you are from your time zone&apos;s reference meridian, plus a small correction for the Equation of Time (the earth&apos;s orbital eccentricity and axial tilt).
                </p>
              </div>
            </section>

            {/* === Standard Time vs Solar Time === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                2. The Gap Between Clock Time and Sun Time
              </h2>

              <p className="mb-4">
                Standard time zones are, at root, political constructs. Each zone is nominally centered on a meridian that is a multiple of 15 degrees from Greenwich: UTC-5 is centered on 75 degrees west (the Eastern Seaboard of the United States), UTC+8 is centered on 120 degrees east (roughly Shanghai and Perth), and so on. In theory, if you live exactly on your time zone&apos;s central meridian, your clock noon and your solar noon are the same (ignoring the Equation of Time for a moment).
              </p>

              <p className="mb-4">
                But very few people live exactly on a meridian. Every degree of longitude east or west of that central meridian shifts your solar noon by four minutes — because the sun traverses 360 degrees of longitude in 24 hours, or 15 degrees per hour, which works out to 1 degree every 4 minutes.
              </p>

              <p className="mb-4">
                A birth in <strong style={{ color: '#F7F8F8' }}>Boston</strong> (longitude 71W), which is 4 degrees east of the UTC-5 meridian (75W), experiences solar noon approximately 16 minutes before clock noon. A birth in <strong style={{ color: '#F7F8F8' }}>Denver</strong> (longitude 105W), 1 degree east of the UTC-7 meridian (105W), is only about 4 minutes off. But a birth in <strong style={{ color: '#F7F8F8' }}>western China</strong> — say, Kashgar in Xinjiang at longitude 76E — is a full 44 degrees west of the UTC+8 meridian (120E), meaning solar noon occurs nearly <strong style={{ color: '#F7F8F8' }}>three hours</strong> after the clock says noon.
              </p>

              <div style={{
                background: 'rgba(59,130,246,0.05)',
                border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: '8px',
                padding: '20px 24px',
                margin: '20px 0',
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#3B82F6', fontSize: '12px', letterSpacing: '0.05em' }}>
                  QUICK FORMULA
                </p>
                <p className="text-sm" style={{ color: 'rgba(247,248,248,0.7)', fontSize: '14px', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace" }}>
                  TST offset = (localLongitude - zoneMeridian) x 4 minutes
                </p>
                <p className="text-xs mt-2" style={{ color: 'rgba(247,248,248,0.4)', fontSize: '12px' }}>
                  Positive = solar noon is ahead of clock noon; negative = solar noon is behind.
                </p>
              </div>

              <p className="mb-4">
                And then there is the <strong style={{ color: '#F7F8F8' }}>Equation of Time</strong>. Earth&apos;s orbit is not a perfect circle — it is an ellipse, and its axis is tilted 23.5 degrees. These two factors cause the sun&apos;s apparent motion to speed up and slow down over the course of the year, creating a discrepancy between mean solar time (the uniform 24-hour day that clocks measure) and apparent solar time (what the sundial shows). This discrepancy ranges from about -14 minutes (February) to +16 minutes (November). A rigorous TST calculation must account for this as well.
              </p>
            </section>

            {/* === Why This Matters for Ba Zi === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                3. Why This Matters for Ba Zi
              </h2>

              <p className="mb-4">
                In Ba Zi, the <strong style={{ color: '#F7F8F8' }}>Day Pillar</strong> (the Heavenly Stem and Earthly Branch of your birth day) does not change at midnight by the clock. It changes at the solar hour <strong style={{ color: '#F7F8F8' }}>Zi Shi</strong> (the Hour of the Rat) — the moment of the sun&apos;s nadir, which is midnight <em>by True Solar Time</em>, not by standard time. The same applies to the other eleven two-hour periods that structure the day: each Shichen is defined by the sun&apos;s actual position, not by what the wall clock says.
              </p>

              <p className="mb-4">
                Consider a concrete example. A child born at <strong style={{ color: '#F7F8F8' }}>11:45 PM standard time</strong> in <strong style={{ color: '#F7F8F8' }}>Lhasa, Tibet</strong> (longitude 91E) on a date in July. Lhasa uses UTC+8, but its longitude is 29 degrees west of the UTC+8 meridian. The solar time offset is 29 x 4 = 116 minutes, or roughly 1 hour and 56 minutes behind clock time. So 11:45 PM standard time corresponds to approximately <strong style={{ color: '#F7F8F8' }}>9:49 PM True Solar Time</strong>. In standard time, we would place this birth in the Hour of the Rat (11 PM - 1 AM). In True Solar Time, it falls firmly in the Hour of the Dog (7 PM - 9 PM). The entire Day Pillar — the single most important column in the Ba Zi chart — would be calculated for a different day because the solar day boundary has not yet been crossed.
              </p>

              <p className="mb-4">
                This is not a marginal edge case. It affects every person born in:
              </p>

              <ul className="space-y-2 mb-6" style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  <strong style={{ color: '#F7F8F8' }}>Western China</strong> (all of Xinjiang, parts of Tibet and Qinghai) — up to 3 hours off
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  <strong style={{ color: '#F7F8F8' }}>Spain</strong> (especially Galicia and western regions, on UTC+1 despite being at similar longitude to the UK) — up to 90 minutes off
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  <strong style={{ color: '#F7F8F8' }}>Western France</strong> (Brittany, on UTC+1 but at longitudes near 4-5W) — up to 50 minutes off
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  <strong style={{ color: '#F7F8F8' }}>Argentina</strong> (western and southern regions) — 45+ minutes off
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  <strong style={{ color: '#F7F8F8' }}>Western Australia</strong> (longitude 114E, on UTC+8 despite covering a wide band)
                </li>
              </ul>

              <p className="mb-4">
                But even within typical time zone bounds — say, 7.5 degrees of the central meridian — the offset can be up to 30 minutes. And since each Shichen is only two hours wide, a 30-minute error can easily push someone from one branch into the next, altering their Earthly Branch and potentially the Heavenly Stem of their Hour Pillar. In a system built on subtle energetic distinctions, half an hour is a great deal.
              </p>

              <div style={{
                background: 'rgba(15,17,17,0.95)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: '8px',
                padding: '20px 24px',
                margin: '20px 0',
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '0.05em' }}>
                  WHY THIS IS OFTEN OVERLOOKED
                </p>
                <p className="text-sm" style={{ color: 'rgba(247,248,248,0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                  Ba Zi was developed in ancient China, where time was universally solar. There was no distinction between &ldquo;standard time&rdquo; and &ldquo;solar time&rdquo; because they were the same thing. The classical texts assume solar time implicitly. The problem only emerged in the 20th century when standardized time zones became global, and Ba Zi practitioners — especially in the West — began using clock times without adjusting for the solar discrepancy. Many modern Ba Zi calculators simply accept the user&apos;s clock input and calculate directly, introducing systematic bias for any birth not at precisely the zone meridian.
                </p>
              </div>
            </section>

            {/* === How Soul Elements Implements TST === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                4. How Soul Elements Implements True Solar Time
              </h2>

              <p className="mb-4">
                Most Ba Zi calculators on the internet today do one of two things: either they ignore TST entirely and use the raw clock time, or they apply a crude offset based on a hardcoded lookup table of major cities. Soul Elements does neither.
              </p>

              <p className="mb-4">
                Our TST pipeline has three stages, each designed for maximum accuracy:
              </p>

              <h3 className="text-lg font-bold mb-2" style={{ color: '#3B82F6', fontFamily: "'Inter', sans-serif" }}>
                Stage 1: Precise Geocoding via Nominatim
              </h3>
              <p className="mb-6">
                When a user enters their birthplace, we query the <strong style={{ color: '#F7F8F8' }}>OpenStreetMap Nominatim API</strong> to resolve the location to GPS coordinates — latitude and longitude accurate to the building level. We do not use a city-center lookup. If you were born in a village in the Swiss Alps or a suburb in Sydney, we get your specific longitude. This matters because a difference of even 0.5 degrees of longitude (2 minutes of solar time) can be the difference between one Shichen and the next for those born very close to a branch boundary.
              </p>

              <h3 className="text-lg font-bold mb-2" style={{ color: '#3B82F6', fontFamily: "'Inter', sans-serif" }}>
                Stage 2: The Meeus Algorithm for Solar Position
              </h3>
              <p className="mb-6">
                With the exact longitude in hand, we calculate True Solar Time using the <strong style={{ color: '#F7F8F8' }}>Jean Meeus algorithm</strong>, specifically the method described in Meeus&apos;s &ldquo;Astronomical Algorithms&rdquo; (1998), which is the gold standard for celestial calculations. This algorithm computes:
              </p>
              <ul className="space-y-2 mb-6" style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  The <strong style={{ color: '#F7F8F8' }}>longitude correction</strong>: 4 minutes per degree east or west of the time zone meridian.
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  The <strong style={{ color: '#F7F8F8' }}>Equation of Time</strong>: the annual sinusoidal correction for the earth&apos;s orbital eccentricity and axial tilt.
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  A <strong style={{ color: '#F7F8F8' }}>sub-second precision</strong> solar position that determines the exact moment the sun crosses the local meridian.
                </li>
              </ul>

              <h3 className="text-lg font-bold mb-2" style={{ color: '#3B82F6', fontFamily: "'Inter', sans-serif" }}>
                Stage 3: Sub-30-Second Boundary Precision
              </h3>
              <p className="mb-4">
                The output of the Meeus calculation is a True Solar Time offset accurate to <strong style={{ color: '#F7F8F8' }}>well under 30 seconds</strong> — an order of magnitude more precise than the typical &ldquo;4-minute per degree&rdquo; approximation. This level of precision is essential for three reasons:
              </p>
              <ul className="space-y-2 mb-6" style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  The Equation of Time varies continuously, and a rough calculation (ignoring it or using a mean annual value) introduces systematic error that can reach 16 minutes at certain times of year.
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  The Shichen boundaries — especially the all-important Zi Shi transition that determines the Day Pillar — are razor-thin. A birth at 10:59 PM standard time in a location with a 62-minute TST offset is actually at 9:57 PM TST, placing it in Xu Shi (the Hour of the Dog) rather than Hai Shi (the Hour of the Pig).
                </li>
                <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                  Historical births before the introduction of standard time zones in a given country should ideally use Local Mean Time (LMT), which is determined by longitude only, without any zone correction. Our system can handle this case.
                </li>
              </ul>

              <p className="mb-4">
                We then use this corrected time — accurate to the second — as the input to our Ba Zi calculation engine, which determines the Heavenly Stems and Earthly Branches for all Four Pillars according to the classical Zi Ping methodology.
              </p>
            </section>

            {/* === Comparison with Other Tools === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                5. How Soul Elements Compares to Other Ba Zi Tools
              </h2>

              <p className="mb-4">
                To understand the landscape, we evaluated the TST handling of the most commonly used Ba Zi calculators. The results are sobering:
              </p>

              <div style={{
                background: 'rgba(15,17,17,0.95)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: '8px',
                padding: '24px',
                margin: '20px 0',
                overflowX: 'auto',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '8px 10px', textAlign: 'left', color: '#C9A84C', fontSize: '11px', letterSpacing: '0.05em' }}>Tool / Platform</th>
                      <th style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '8px 10px', textAlign: 'center', color: '#C9A84C', fontSize: '11px', letterSpacing: '0.05em' }}>TST Support</th>
                      <th style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '8px 10px', textAlign: 'center', color: '#C9A84C', fontSize: '11px', letterSpacing: '0.05em' }}>Precision</th>
                      <th style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '8px 10px', textAlign: 'center', color: '#C9A84C', fontSize: '11px', letterSpacing: '0.05em' }}>Geocoding</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 10px', color: 'rgba(247,248,248,0.7)' }}>Most free Ba Zi websites</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#EF4444' }}>No</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'rgba(247,248,248,0.4)' }}>N/A</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'rgba(247,248,248,0.4)' }}>None</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 10px', color: 'rgba(247,248,248,0.7)' }}>Major Ba Zi apps (top 10)</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#F59E0B' }}>Mixed (~3/10)</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#F59E0B' }}>~10-30 min</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#F59E0B' }}>City-level</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 10px', color: 'rgba(247,248,248,0.7)' }}>Advanced Chinese software</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981' }}>Yes</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981' }}>~1-5 min</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981' }}>City-level</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 10px', color: '#C9A84C', fontWeight: 600 }}>Soul Elements</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981', fontWeight: 600 }}>Yes (Meeus)</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981', fontWeight: 600 }}>&lt;30 sec</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#10B981', fontWeight: 600 }}>Building-level (Nominatim)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-4">
                The vast majority of free Ba Zi tools simply take the user&apos;s entered time at face value and pass it directly to the calculation engine. Some better ones offer a checkbox labeled &ldquo;True Solar Time&rdquo; that applies a fixed city-based lookup — but this is often based on a static database that covers only major cities, uses mean approximations, and does not account for the Equation of Time.
              </p>

              <p className="mb-4">
                <strong style={{ color: '#F7F8F8' }}>Soul Elements is built differently.</strong> We treat TST not as a checkbox feature but as a fundamental input requirement. Every birth time is converted to True Solar Time using the full Meeus algorithm with the user&apos;s exact GPS coordinates. There is no toggle to turn it off — because there is no scenario in which clock time is more astronomically correct than solar time for a system that was designed around the sun&apos;s position.
              </p>
            </section>

            {/* === A Worked Example === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                6. A Worked Example: The Kashgar Case
              </h2>

              <p className="mb-4">
                Let us walk through a <strong style={{ color: '#F7F8F8' }}>real-world case</strong> that illustrates the power of TST.
              </p>

              <p className="mb-4">
                Consider a person born in <strong style={{ color: '#F7F8F8' }}>Kashgar, Xinjiang, China</strong> (latitude 39.47N, longitude 75.98E) on <strong style={{ color: '#F7F8F8' }}>July 15, 1990, at 1:30 AM</strong> local standard time (UTC+8).
              </p>

              <div style={{
                background: 'rgba(15,17,17,0.95)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: '8px',
                padding: '20px 24px',
                margin: '20px 0',
              }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '0.05em' }}>
                  CALCULATION WALKTHROUGH
                </p>
                <div className="space-y-2" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                  <p style={{ color: 'rgba(247,248,248,0.7)' }}>
                    <strong style={{ color: '#F7F8F8' }}>Step 1 — Longitude offset:</strong><br />
                    UTC+8 central meridian = 120E<br />
                    Kashgar longitude = 75.98E<br />
                    Difference = 120 - 75.98 = 44.02 degrees west of the meridian<br />
                    Raw TST offset = 44.02 x 4 = <strong style={{ color: '#F7F8F8' }}>176.08 minutes (2h 56m)</strong>
                  </p>
                  <p style={{ color: 'rgba(247,248,248,0.7)' }}>
                    <strong style={{ color: '#F7F8F8' }}>Step 2 — Equation of Time (July 15):</strong><br />
                    On July 15, the Equation of Time is approximately -6 minutes (the sun is running slightly slow relative to the mean).<br />
                    Final TST offset = 176.08 + (-6) = <strong style={{ color: '#F7F8F8' }}>170.08 minutes (2h 50m)</strong>
                  </p>
                  <p style={{ color: 'rgba(247,248,248,0.7)' }}>
                    <strong style={{ color: '#F7F8F8' }}>Step 3 — Corrected birth time:</strong><br />
                    1:30 AM UTC+8 standard time<br />
                    Subtract 2h 50m = <strong style={{ color: '#F7F8F8' }}>10:40 PM TST (previous day)</strong>
                  </p>
                  <p style={{ color: 'rgba(247,248,248,0.7)' }}>
                    <strong style={{ color: '#F7F8F8' }}>Step 4 — Impact on Ba Zi chart:</strong><br />
                    Standard time: 1:30 AM = Hour of the Ox (Chou Shi, 1-3 AM)<br />
                    True Solar Time: 10:40 PM = Hour of the Pig (Hai Shi, 9-11 PM)<br />
                    The <strong style={{ color: '#F7F8F8' }}>Day Pillar also shifts</strong> by one day since the solar day boundary (Zi Shi, 11 PM TST) has not yet been crossed.<br />
                    Result: <strong style={{ color: '#F7F8F8' }}>All Four Pillars are affected</strong> — both the Day Master and the Hour Pillar change entirely.
                  </p>
                </div>
              </div>

              <p className="mb-4">
                In this case, a standard-time Ba Zi calculation produces a chart with entirely different Day Master, different Earthly Branches for both the Day and Hour pillars, and therefore a completely different elemental analysis, different Ten Deities, and different Luck Cycle starting positions. The person&apos;s entire reading would be wrong.
              </p>

              <p className="mb-4">
                It is worth noting that Xinjiang is an extreme case — the Chinese government controversially uses a single time zone (UTC+8) across the entire country, even though Xinjiang&apos;s geographic longitude would naturally place it in UTC+5 or UTC+6. But less dramatic versions of this problem exist everywhere.
              </p>
            </section>

            {/* === Conclusion === */}
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', lineHeight: '1.2' }}>
                Conclusion: The Sun Does Not Check Your Time Zone
              </h2>

              <p className="mb-4">
                Ba Zi is a system rooted in the observation of nature — specifically, the observation of the sun&apos;s relationship to the earth. The Heavenly Stems and Earthly Branches are not arbitrary symbols. They encode the actual energetic signatures of the solar year, the lunar month, and the solar day. When we use standard clock time instead of True Solar Time, we introduce an artifact of 19th-century railroad scheduling into a system that predates railroads by two millennia.
              </p>

              <p className="mb-4">
                At Soul Elements, we believe that if you are going to consult a 2,500-year-old system for understanding yourself, you should do it with the most accurate tools available. Sub-30-second True Solar Time precision, geocoded to your exact birthplace, is not a luxury — it is a baseline requirement for any serious Ba Zi calculation.
              </p>

              <p className="mb-4">
                The sun does not care where your government drew the time zone boundary. And neither should your Ba Zi chart.
              </p>

              <div style={{
                background: 'rgba(15,17,17,0.95)',
                border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: '8px',
                padding: '20px 24px',
                margin: '30px 0',
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#3B82F6', fontSize: '12px', letterSpacing: '0.05em' }}>
                  FURTHER READING
                </p>
                <ul className="space-y-1.5" style={{ paddingLeft: '16px', listStyleType: 'disc', fontSize: '14px', lineHeight: '1.7' }}>
                  <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                    Meeus, Jean. <em style={{ color: '#C9A84C' }}>Astronomical Algorithms</em>, 2nd Edition. Willmann-Bell, 1998.
                  </li>
                  <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                    The Equation of Time explained: <span style={{ color: '#3B82F6' }}>aa.usno.navy.mil</span>
                  </li>
                  <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                    OpenStreetMap Nominatim: <span style={{ color: '#3B82F6' }}>nominatim.openstreetmap.org</span>
                  </li>
                  <li style={{ color: 'rgba(247,248,248,0.65)' }}>
                    Chinese Solar Calendar and the 24 Solar Terms — classical Ba Zi methodology
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Bottom divider */}
          <div className="mt-12 mb-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />

          {/* Share / Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <Link href="/"
              className="text-sm font-medium px-4 py-2 rounded"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none' }}>
              Get Your Ba Zi Reading
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs" style={{ color: 'rgba(247,248,248,0.2)' }}>
              Soul Elements — Precision Ba Zi for the Modern Seeker
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
