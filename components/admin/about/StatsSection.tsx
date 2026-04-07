// components/admin/about/StatsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaDumbbell,
  FaGlobeAmericas,
  FaSmile,
} from 'react-icons/fa';

type StatItem = {
  icon: React.ReactElement;
  label: string;
  value: number;
  suffix?: string;
  accent: string;
};

export default function StatsSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats: StatItem[] = [
    {
      icon: <FaUsers />,
      label: 'Clients Trained',
      value: 500,
      suffix: '+',
      accent: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
    },
    {
      icon: <FaDumbbell />,
      label: 'Workouts Completed',
      value: 10000,
      suffix: '+',
      accent: 'linear-gradient(135deg, rgba(91,209,215,0.18), rgba(126,142,241,0.16))',
    },
    {
      icon: <FaGlobeAmericas />,
      label: 'Countries Reached',
      value: 20,
      suffix: '+',
      accent: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(16,185,129,0.14))',
    },
    {
      icon: <FaSmile />,
      label: 'Satisfaction Rate',
      value: 95,
      suffix: '%',
      accent: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.14))',
    },
  ];

  return (
    <section
      style={{
        width: '100%',
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background:
          'linear-gradient(180deg, #ffffff 0%, #f8fafc 45%, #f3f4f6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-110px',
          left: isDesktop ? '110px' : '-40px',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.08)',
          filter: 'blur(46px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          right: '-60px',
          width: 270,
          height: 270,
          borderRadius: '50%',
          background: 'rgba(91,209,215,0.10)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{
            maxWidth: '760px',
            margin: '0 auto 3.5rem auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.45rem 0.9rem',
              borderRadius: 999,
              background: 'rgba(139,92,246,0.10)',
              color: '#8b5cf6',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Our Impact
          </span>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#111827',
              marginBottom: '1rem',
            }}
          >
            Numbers that reflect real progress
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            A growing community, consistent results, and coaching support that
            keeps members moving forward with confidence.
          </p>
        </motion.div>

        <div className="row g-4 justify-content-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="col-12 col-sm-6 col-xl-3"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 30,
                  padding: '1.5rem 1.35rem',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.96))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow:
                    '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.9rem',
                }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                  boxShadow:
                    '0 24px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: s.accent,
                    color: '#8b5cf6',
                    fontSize: '1.45rem',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                  }}
                >
                  {s.icon}
                </div>

                <div
                  style={{
                    fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: '#111827',
                    lineHeight: 1,
                  }}
                >
                  {s.value.toLocaleString()}
                  {s.suffix}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {s.label}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

{/*
'use client';

import { motion } from 'framer-motion';
import { FaUsers, FaDumbbell, FaGlobeAmericas, FaSmile } from 'react-icons/fa';

type StatItem = {
  icon: React.ReactElement;
  label: string;
  value: number;
  suffix?: string;
};

export default function StatsSection() {
  const stats: StatItem[] = [
    { icon: <FaUsers />, label: 'Clients Trained', value: 500, suffix: '+' },
    { icon: <FaDumbbell />, label: 'Workouts Completed', value: 10000, suffix: '+' },
    { icon: <FaGlobeAmericas />, label: 'Countries Reached', value: 20, suffix: '+' },
    { icon: <FaSmile />, label: 'Satisfaction Rate', value: 95, suffix: '%' },
  ];

  return (
    <section className="stats-section py-5 shadow-sm ">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="fw-bold mb-3 fs-2">Our Impact</h1>
          <p className="text-muted">Numbers that showcase our journey</p>
        </motion.div>

        <div className="row g-4 text-center justify-content-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="col-6 col-md-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="stat-item">
                <div className="stat-icon mb-2">{s.icon}</div>
                <h1 className="stat-value">
                  {s.value.toLocaleString()}
                  {s.suffix}
                </h1>
                <p className="stat-label">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/}
