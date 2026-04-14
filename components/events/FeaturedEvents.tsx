// components/events/FeaturedEvents.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin } from 'react-icons/fi';

const events = [
  {
    title: 'Strength Foundations Workshop',
    date: 'May 12',
    time: '6:00 PM',
    location: 'Virtual Session',
    description: 'Learn proper form, progressive overload, and beginner-friendly strength structure.',
  },
  {
    title: 'Mobility & Recovery Flow',
    date: 'May 19',
    time: '10:00 AM',
    location: 'FitByLena Studio',
    description: 'A guided recovery session focused on flexibility, breathing, and joint health.',
  },
  {
    title: 'Nutrition Reset Week',
    date: 'June 2',
    time: 'All Week',
    location: 'Online Program',
    description: 'Simple meal guidance, habit tracking, and accountability for sustainable nutrition.',
  },
];

export default function FeaturedEvents() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="featured-events"
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
          padding: isDesktop ? '4.5rem 2rem' : '3rem 1rem',
          background:
            'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 35%, #eef7ff 72%, #fdfcff 100%)',
          boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
        }}
      >
        <div className="text-center" style={{ maxWidth: 760, margin: '0 auto 3.5rem' }}>
          <span style={{ color: '#8b5cf6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Featured Events
          </span>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, color: '#111827', marginTop: 12 }}>
            Upcoming ways to move, learn, and connect
          </h2>
        </div>

        <div className="row g-4">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              className="col-12 col-lg-4"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.015 }}
                style={{
                  height: '100%',
                  padding: '1.5rem',
                  borderRadius: 30,
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 16px 38px rgba(15,23,42,0.07)',
                }}
              >
                <div style={{ color: '#8b5cf6', fontWeight: 900, fontSize: '1.4rem', marginBottom: 10 }}>
                  {event.date}
                </div>
                <h3 style={{ fontWeight: 900, color: '#111827', fontSize: '1.2rem' }}>{event.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.75 }}>{event.description}</p>

                <div style={{ display: 'grid', gap: 8, color: '#475569', fontWeight: 700 }}>
                  <span><FiClock /> {event.time}</span>
                  <span><FiMapPin /> {event.location}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}