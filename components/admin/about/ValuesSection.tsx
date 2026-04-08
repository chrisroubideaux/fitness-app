// components/admin/about/ValuesSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaDumbbell,
  FaBalanceScale,
  FaClock,
  FaBrain,
} from 'react-icons/fa';

export default function ValuesSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const values = [
    {
      icon: <FaClock />,
      title: 'Consistency',
      description: 'Commitment every day builds long-term success.',
      accent:
        'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
    },
    {
      icon: <FaDumbbell />,
      title: 'Strength',
      description: 'True strength is built in body, mind, and spirit.',
      accent:
        'linear-gradient(135deg, rgba(91,209,215,0.18), rgba(126,142,241,0.16))',
    },
    {
      icon: <FaBalanceScale />,
      title: 'Balance',
      description: 'Fitness that supports—not disrupts—your lifestyle.',
      accent:
        'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(16,185,129,0.14))',
    },
    {
      icon: <FaBrain />,
      title: 'Mindset',
      description: 'Growth comes from discipline, focus, and positivity.',
      accent:
        'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.14))',
    },
  ];

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
          maxWidth: '1240px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '38px',
          padding: isDesktop ? '4.5rem 2rem' : '3rem 1rem',
          background:
            'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 35%, #eef7ff 72%, #fdfcff 100%)',
          boxShadow:
            '0 18px 45px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.45)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 28%), radial-gradient(circle at bottom left, rgba(91,209,215,0.08), transparent 26%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-60px',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.08)',
            filter: 'blur(52px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-130px',
            left: '-50px',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(91,209,215,0.08)',
            filter: 'blur(56px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
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
              Core Values
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
              The principles behind every transformation
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '1.05rem',
                lineHeight: 1.8,
              }}
            >
              These are the values that shape every coaching decision, every
              program, and every success story inside the FitByLena experience.
            </p>
          </motion.div>

          <div className="row g-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                className="col-12 col-md-6 col-xl-3"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    padding: '1.5rem 1.35rem',
                    borderRadius: 30,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.92))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow:
                      '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.015,
                    boxShadow:
                      '0 26px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10)',
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
                      background: value.accent,
                      color: '#8b5cf6',
                      fontSize: '1.4rem',
                      marginBottom: '1rem',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
                    }}
                  >
                    {value.icon}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#111827',
                      marginBottom: '0.7rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {value.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.95rem',
                      lineHeight: 1.75,
                    }}
                  >
                    {value.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

{/*

'use client';

import { motion } from 'framer-motion';
import { FaDumbbell, FaBalanceScale, FaClock, FaBrain } from 'react-icons/fa';

export default function ValuesSection() {
  const values = [
    {
      icon: <FaClock className='value-icon' />,
      title: 'Consistency',
      description: 'Commitment every day builds long-term success.',
    },
    {
      icon: <FaDumbbell className='value-icon' />,
      title: 'Strength',
      description: 'True strength is built in body, mind, and spirit.',
    },
    {
      icon: <FaBalanceScale className='value-icon' />,
      title: 'Balance',
      description: 'Fitness that supports—not disrupts—your lifestyle.',
    },
    {
      icon: <FaBrain className='value-icon' />,
      title: 'Mindset',
      description: 'Growth comes from discipline, focus, and positivity.',
    },
  ];

  return (
    <section className="values-section py-5 shadow-lg">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="fw-bold mb-3">Core Values</h2>
          <p className="text-white">
            The principles that guide every training session and every success story.
          </p>
        </motion.div>

        <div className="row g-4">
          {values.map((value, i) => (
            <motion.div
              key={i}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="value-card text-center p-4 h-100">
                <div className="value-icon mb-3">{value.icon}</div>
                <h5 className="fw-semibold">{value.title}</h5>
                <p className="text-muted small">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/}