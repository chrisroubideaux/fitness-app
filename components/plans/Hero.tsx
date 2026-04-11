// components/plans/Hero.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiZap } from 'react-icons/fi';

export default function Hero() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      className="plans-hero"
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #f8fbff 0%, #eef4ff 30%, #ede9fe 68%, #fdfcff 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(96,165,250,0.12), transparent 26%), radial-gradient(circle at bottom left, rgba(168,85,247,0.10), transparent 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-60px',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(96,165,250,0.12)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-140px',
          left: isDesktop ? '90px' : '-40px',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(168,85,247,0.10)',
          filter: 'blur(64px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          position: 'relative',
          zIndex: 2,
          padding: isDesktop ? '0 3rem 0 7.25rem' : '0 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-12 col-xl-7">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  maxWidth: '760px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.62)',
                    color: '#7c3aed',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    border: '1px solid rgba(139,92,246,0.10)',
                    boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                  }}
                >
                  <FiZap size={14} />
                  Membership Plans
                </span>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.7rem, 6vw, 5.6rem)',
                    lineHeight: 0.94,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: '#111827',
                  }}
                >
                  Choose the plan
                  <br />
                  that fits your
                  <br />
                  fitness journey
                </h1>

                <p
                  style={{
                    marginTop: '1.35rem',
                    marginBottom: '1.75rem',
                    maxWidth: '650px',
                    fontSize: 'clamp(1rem, 1.4vw, 1.12rem)',
                    lineHeight: 1.85,
                    color: '#64748b',
                  }}
                >
                  Start with the essentials or unlock more advanced coaching,
                  structure, accountability, and AI-powered support built around
                  your goals and schedule.
                </p>

                <div
                  className="d-flex flex-wrap"
                  style={{
                    gap: '0.85rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <a
                    href="#plans-grid"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      padding: '0.95rem 1.25rem',
                      borderRadius: 16,
                      textDecoration: 'none',
                      color: '#ffffff',
                      background:
                        'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      fontWeight: 700,
                      boxShadow: '0 14px 30px rgba(139,92,246,0.22)',
                    }}
                  >
                    <span>Explore Plans</span>
                    <FiArrowRight size={16} />
                  </a>

                  <a
                    href="/contact"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      padding: '0.95rem 1.25rem',
                      borderRadius: 16,
                      textDecoration: 'none',
                      color: '#334155',
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(148,163,184,0.18)',
                      fontWeight: 700,
                      boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
                    }}
                  >
                    Book a Consultation
                  </a>
                </div>

                <div
                  className="d-flex flex-wrap"
                  style={{
                    gap: '0.85rem',
                  }}
                >
                  {[
                    'Flexible options',
                    'AI-powered support',
                    'Upgrade anytime',
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.7rem 0.95rem',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.64)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
                      }}
                    >
                      <FiCheckCircle size={16} color="#8b5cf6" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="col-12 col-xl-5">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
              >
                <div
                  style={{
                    borderRadius: 32,
                    padding: isDesktop ? '2rem' : '1.4rem',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(248,250,252,0.88))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow:
                      '0 20px 50px rgba(15,23,42,0.08), inset 0 0 0 1px rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {[
                      { value: '3', label: 'Plan tiers' },
                      { value: '24/7', label: 'AI guidance' },
                      { value: '1:1', label: 'Trainer support' },
                      { value: 'Flexible', label: 'Monthly options' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          padding: '1rem',
                          borderRadius: 20,
                          background: 'rgba(255,255,255,0.72)',
                          border: '1px solid rgba(148,163,184,0.12)',
                          boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            color: '#111827',
                            marginBottom: '0.35rem',
                          }}
                        >
                          {stat.value}
                        </div>
                        <div
                          style={{
                            fontSize: '0.92rem',
                            color: '#64748b',
                            lineHeight: 1.5,
                          }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem 1.1rem',
                      borderRadius: 22,
                      background:
                        'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(96,165,250,0.08))',
                      border: '1px solid rgba(139,92,246,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: '#111827',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Built for real life
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        lineHeight: 1.75,
                        fontSize: '0.95rem',
                      }}
                    >
                      Whether you want to get started, stay consistent, or level
                      up your results, there’s a plan built for your pace.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}