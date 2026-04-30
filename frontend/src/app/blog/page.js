'use client';

import Link from 'next/link';

const blogPosts = [
  {
    slug: 'true-solar-time-bazi',
    title: 'True Solar Time in Ba Zi: Why Your Birth Time Probably Needs Adjustment',
    excerpt: 'Most Ba Zi calculators use standard clock time — but your birth moment is defined by the sun\'s actual position, not a political time zone boundary. Discover why sub-30-second True Solar Time precision matters for accurate Four Pillars calculation.',
    date: 'April 30, 2026',
    readTime: '12 min read',
    tags: ['True Solar Time', 'Ba Zi Accuracy', 'Technical'],
  },
];

export default function BlogPage() {
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

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '8vh', paddingBottom: '8vh' }}>
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>
              Soul Elements Blog
            </h1>
            <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: '#C9A84C', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'rgba(247,248,248,0.6)', maxWidth: '500px', margin: '0 auto' }}>
              Essays on Ba Zi, the Four Pillars of Destiny, True Solar Time, and the intersection of ancient Chinese metaphysics with modern computational accuracy.
            </p>
          </div>

          {/* Divider */}
          <div className="mb-10" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />

          {/* Blog List */}
          <div className="space-y-0">
            {blogPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="block group"
                style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'rgba(15,17,17,0.95)',
                  border: '1px solid rgba(201,168,76,0.08)',
                  borderRadius: '12px',
                  padding: '32px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                  e.currentTarget.style.background = 'rgba(20,22,26,0.95)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)';
                  e.currentTarget.style.background = 'rgba(15,17,17,0.95)';
                }}>
                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-xs" style={{ color: 'rgba(247,248,248,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                      {post.date}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(247,248,248,0.25)' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(247,248,248,0.4)', fontSize: '11px' }}>
                      {post.readTime}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(247,248,248,0.25)' }}>·</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: '10px' }}>
                      {post.tags[0]}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-3" style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#F7F8F8',
                    transition: 'color 0.3s ease',
                    lineHeight: '1.3',
                  }}>
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(247,248,248,0.65)', lineHeight: '1.7' }}>
                    {post.excerpt}
                  </p>

                  {/* Read indicator */}
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="text-xs font-medium" style={{ color: '#C9A84C' }}>
                      Read Article
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Empty state note for future posts */}
          <div className="mt-10 text-center">
            <p className="text-xs" style={{ color: 'rgba(247,248,248,0.25)' }}>
              More articles coming soon
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-12">
            <Link href="/"
              className="inline-block text-sm font-medium px-6 py-2.5 rounded"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
