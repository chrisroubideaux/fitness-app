// components/events/EventCategories.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiUsers, FiZap } from 'react-icons/fi';

const categories = [
  { icon: <FiZap />, title: 'Training Workshops', text: 'Strength, form, conditioning, and skill-building sessions.' },
  { icon: <FiHeart />, title: 'Wellness Sessions', text: 'Mobility, recovery, breathwork, and sustainable habit support.' },
  { icon: <FiUsers />, title: 'Community Challenges', text: 'Group challenges built to keep motivation high and progress visible.' },
];

export default function EventCategories() {
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
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="row g-4 align-items-stretch">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              className="col-12 col-lg-4"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <div
                style={{
                  height: '100%',
                  padding: '1.5rem',
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 16px 38px rgba(15,23,42,0.07)',
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(96,165,250,0.14))',
                    color: '#8b5cf6',
                    fontSize: '1.4rem',
                    marginBottom: '1rem',
                  }}
                >
                  {cat.icon}
                </div>

                <h3 style={{ fontWeight: 900, color: '#111827' }}>{cat.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.75, margin: 0 }}>{cat.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}