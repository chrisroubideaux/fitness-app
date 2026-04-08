// components/about/JourneyTimeline.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

export default function JourneyTimeline() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const milestones = [
    {
      year: '2015',
      title: 'Certified Personal Trainer',
      description:
        'Became officially certified and started helping clients transform their fitness.',
    },
    {
      year: '2017',
      title: 'Expanded into Nutrition Coaching',
      description:
        'Added personalized meal plans and holistic wellness to training programs.',
    },
    {
      year: '2020',
      title: 'FitByLena Community',
      description:
        'Launched an online community to connect and inspire fitness enthusiasts worldwide.',
    },
    {
      year: '2025',
      title: 'AI-Powered Training',
      description:
        'Introduced smart, personalized AI coaching to empower clients anywhere, anytime.',
    },
  ];

  return (
    <section
      style={{
        width: '100%',
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background:
          'linear-gradient(180deg, #ffffff 0%, #f8fafc 42%, #f3f4f6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-110px',
          right: '-70px',
          width: 260,
          height: 260,
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
          left: isDesktop ? '90px' : '-40px',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(236,72,153,0.08)',
          filter: 'blur(52px)',
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
            margin: '0 auto 3.75rem auto',
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
            My Journey
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
            The milestones that shaped my coaching path
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            From certification to community building and AI-powered support,
            each step has helped shape a more modern, effective approach to
            fitness and wellness coaching.
          </p>
        </motion.div>

        <div
          style={{
            position: 'relative',
            maxWidth: '980px',
            margin: '0 auto',
          }}
        >
          {isDesktop && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: 2,
                transform: 'translateX(-50%)',
                background:
                  'linear-gradient(180deg, rgba(139,92,246,0.20), rgba(236,72,153,0.18), rgba(91,209,215,0.18))',
                borderRadius: 999,
              }}
            />
          )}

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            {milestones.map((m, i) => {
              const desktopLeft = isDesktop && i % 2 === 0;

              return (
                <motion.div
                  key={m.year + m.title}
                  initial={{
                    opacity: 0,
                    y: 30,
                    x: isDesktop ? (desktopLeft ? -30 : 30) : 0,
                  }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    justifyContent: isDesktop
                      ? desktopLeft
                        ? 'flex-start'
                        : 'flex-end'
                      : 'flex-start',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: isDesktop ? 'calc(50% - 28px)' : '100%',
                      position: 'relative',
                    }}
                  >
                    {isDesktop && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '1.55rem',
                          [desktopLeft ? 'right' : 'left']: '-40px',
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#ffffff',
                          border: '2px solid rgba(139,92,246,0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 18px rgba(15,23,42,0.10)',
                          zIndex: 2,
                        }}
                      >
                        <FaCheckCircle size={11} color="#8b5cf6" />
                      </div>
                    )}

                    <motion.div
                      whileHover={{
                        y: -6,
                        boxShadow:
                          '0 24px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)',
                      }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        padding: isDesktop ? '1.5rem' : '1.25rem',
                        borderRadius: 28,
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
                        border: '1px solid rgba(139,92,246,0.08)',
                        boxShadow:
                          '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                        position: 'relative',
                      }}
                    >
                      {!isDesktop && (
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
                            color: '#8b5cf6',
                            marginBottom: '1rem',
                          }}
                        >
                          <FaCheckCircle size={18} />
                        </div>
                      )}

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 999,
                          background: 'rgba(139,92,246,0.10)',
                          color: '#8b5cf6',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          marginBottom: '0.95rem',
                        }}
                      >
                        {m.year}
                      </span>

                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: '#111827',
                          marginBottom: '0.7rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {m.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '0.96rem',
                          lineHeight: 1.75,
                        }}
                      >
                        {m.description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

{/*
'use client';

import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

export default function JourneyTimeline() {
  const milestones = [
    {
      year: '2015',
      title: 'Certified Personal Trainer',
      description: 'Became officially certified and started helping clients transform their fitness.',
    },
    {
      year: '2017',
      title: 'Expanded into Nutrition Coaching',
      description: 'Added personalized meal plans and holistic wellness to training programs.',
    },
    {
      year: '2020',
      title: 'FitByLena Community',
      description: 'Launched an online community to connect and inspire fitness enthusiasts worldwide.',
    },
    {
      year: '2025',
      title: 'AI-Powered Training',
      description: 'Introduced smart, personalized AI coaching to empower clients anywhere, anytime.',
    },
  ];

  return (
    <section className="journey-section py-5 shadow-lg">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="fw-bold mb-3 fs-2">My Journey</h1>
          <p className="text-muted">
            The milestones that shaped my path as a trainer and wellness coach.
          </p>
        </motion.div>

        <div className="timeline">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              className="timeline-item"
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="timeline-icon">
                <FaCheckCircle />
              </div>
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <h5 className="fw-semibold">{m.title}</h5>
                <p className="small text-muted">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/}
