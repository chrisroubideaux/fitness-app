// components/plans/WhyChoose.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiBarChart2, FiShield, FiUsers } from 'react-icons/fi';

const items = [
  {
    icon: <FiActivity />,
    title: 'Personalized structure',
    description:
      'Plans are designed to match your goals, lifestyle, and current fitness level.',
    accent:
      'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
  },
  {
    icon: <FiBarChart2 />,
    title: 'Track real progress',
    description:
      'Build momentum with smart structure, measurable growth, and better consistency.',
    accent:
      'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(125,211,252,0.14))',
  },
  {
    icon: <FiUsers />,
    title: 'Support that scales',
    description:
      'Start simple or unlock deeper coaching and accountability as your goals evolve.',
    accent:
      'linear-gradient(135deg, rgba(91,209,215,0.18), rgba(126,142,241,0.16))',
  },
  {
    icon: <FiShield />,
    title: 'Built for sustainability',
    description:
      'No extreme routines. Just practical fitness support designed for real life.',
    accent:
      'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.14))',
  },
];

export default function WhyChoose() {
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
          <div
            className="text-center"
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
              Why Choose Us
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
              More than a plan. A better system for progress.
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '1.05rem',
                lineHeight: 1.8,
              }}
            >
              Every membership is built to help you stay consistent, supported,
              and confident as you build long-term results.
            </p>
          </div>

          <div className="row g-4">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                className="col-12 col-md-6 col-xl-3"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.015,
                    boxShadow:
                      '0 24px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10)',
                  }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    padding: '1.5rem 1.35rem',
                    borderRadius: 30,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow:
                      '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                    textAlign: 'center',
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
                      margin: '0 auto 1rem auto',
                      background: item.accent,
                      color: '#8b5cf6',
                      fontSize: '1.35rem',
                    }}
                  >
                    {item.icon}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.08rem',
                      fontWeight: 800,
                      color: '#111827',
                      marginBottom: '0.7rem',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.95rem',
                      lineHeight: 1.75,
                    }}
                  >
                    {item.description}
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

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiBarChart2, FiShield, FiUsers } from 'react-icons/fi';

const items = [
  {
    icon: <FiActivity />,
    title: 'Personalized structure',
    description:
      'Plans are designed to match your goals, lifestyle, and current fitness level.',
    accent:
      'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
  },
  {
    icon: <FiBarChart2 />,
    title: 'Track real progress',
    description:
      'Build momentum with smart structure, measurable growth, and better consistency.',
    accent:
      'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(125,211,252,0.14))',
  },
  {
    icon: <FiUsers />,
    title: 'Support that scales',
    description:
      'Start simple or unlock deeper coaching and accountability as your goals evolve.',
    accent:
      'linear-gradient(135deg, rgba(91,209,215,0.18), rgba(126,142,241,0.16))',
  },
  {
    icon: <FiShield />,
    title: 'Built for sustainability',
    description:
      'No extreme routines. Just practical fitness support designed for real life.',
    accent:
      'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.14))',
  },
];

export default function WhyChoose() {
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
        background:
          'linear-gradient(180deg, #ffffff 0%, #f8fafc 42%, #f3f4f6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          className="text-center"
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
            Why Choose Us
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
            More than a plan. A better system for progress.
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            Every membership is built to help you stay consistent, supported,
            and confident as you build long-term results.
          </p>
        </div>

        <div className="row g-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              className="col-12 col-md-6 col-xl-3"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  scale: 1.015,
                  boxShadow:
                    '0 24px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10)',
                }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  padding: '1.5rem 1.35rem',
                  borderRadius: 30,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow:
                    '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                  textAlign: 'center',
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
                    margin: '0 auto 1rem auto',
                    background: item.accent,
                    color: '#8b5cf6',
                    fontSize: '1.35rem',
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '0.7rem',
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                  }}
                >
                  {item.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/}