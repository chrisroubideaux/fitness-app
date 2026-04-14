// components/events/EventsHero.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiArrowRight, FiMapPin } from 'react-icons/fi';

export default function EventsHero() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: isDesktop ? '0 3rem 0 7.25rem' : '0 1rem',
        background:
          'linear-gradient(135deg, #f8fbff 0%, #eef4ff 34%, #ede9fe 70%, #fdfcff 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(139,92,246,0.12), transparent 28%), radial-gradient(circle at bottom left, rgba(96,165,250,0.12), transparent 28%)',
        }}
      />

      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 760 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.45rem 0.9rem',
              borderRadius: 999,
              background: 'rgba(139,92,246,0.10)',
              color: '#7c3aed',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <FiCalendar /> Events
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5.6rem)',
              lineHeight: 0.94,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#111827',
              marginBottom: '1.25rem',
            }}
          >
            Train together.
            <br />
            Grow stronger.
            <br />
            Stay inspired.
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.08rem', lineHeight: 1.85, maxWidth: 650 }}>
            Join upcoming workshops, wellness sessions, group training days, and community fitness events designed to keep you motivated.
          </p>

          <div className="d-flex flex-wrap" style={{ gap: '0.85rem', marginTop: '1.75rem' }}>
            <a
              href="#featured-events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.95rem 1.25rem',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                boxShadow: '0 14px 30px rgba(139,92,246,0.22)',
              }}
            >
              View Events <FiArrowRight />
            </a>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.95rem 1.25rem',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.72)',
                color: '#475569',
                fontWeight: 700,
              }}
            >
              <FiMapPin /> Online & Local
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}