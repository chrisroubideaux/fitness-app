// components/events/EventsCTA.tsx
'use client';

import { useEffect, useState } from 'react';

export default function EventsCTA() {
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
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background: 'transparent',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          borderRadius: 38,
          padding: isDesktop ? '4rem 2rem' : '3rem 1.25rem',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, #8b5cf6 0%, #6366f1 48%, #60a5fa 100%)',
          color: '#fff',
          boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900 }}>
          Ready for the next event?
        </h2>
        <p style={{ maxWidth: 680, margin: '1rem auto 1.75rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8 }}>
          New sessions, workshops, and challenges will be added soon. For now, you can reach out to ask about upcoming availability.
        </p>

        <a
          href="/contact"
          style={{
            display: 'inline-flex',
            padding: '0.95rem 1.3rem',
            borderRadius: 16,
            background: '#fff',
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: 900,
          }}
        >
          Contact Lena
        </a>
      </div>
    </section>
  );
}