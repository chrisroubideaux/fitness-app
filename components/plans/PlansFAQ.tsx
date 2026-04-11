// components/plans/WhyChoose.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    q: 'Can I change my plan later?',
    a: 'Yes. You can upgrade or switch plans later as your goals and support needs change.',
  },
  {
    q: 'Do I need to be experienced to start?',
    a: 'Not at all. The plans are designed to support beginners, intermediate members, and more advanced users.',
  },
  {
    q: 'What happens if I start with the free plan?',
    a: 'You can begin with the basics, explore the platform, and upgrade whenever you want more structure or support.',
  },
  {
    q: 'Are the plans flexible?',
    a: 'Yes. The goal is to support real-life schedules, not force rigid routines that are hard to maintain.',
  },
];

export default function PlansFAQ() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          overflow: 'hidden',
          borderRadius: 38,
          padding: isDesktop ? '4.5rem 2rem' : '3rem 1rem',
          background:
            'linear-gradient(135deg, #f8fbff 0%, #eef4ff 34%, #ede9fe 68%, #fdfcff 100%)',
          boxShadow:
            '0 18px 45px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.45)',
          position: 'relative',
        }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: '760px',
            margin: '0 auto 3rem auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.45rem 0.9rem',
              borderRadius: 999,
              background: 'rgba(96,165,250,0.10)',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            FAQ
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
            Questions about plans?
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            A few quick answers to help you choose the option that fits you best.
          </p>
        </div>

        <div style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gap: '1rem' }}>
          {faqs.map((item, i) => {
            const open = openIndex === i;

            return (
              <div
                key={item.q}
                style={{
                  borderRadius: 24,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
                  border: '1px solid rgba(96,165,250,0.08)',
                  boxShadow:
                    '0 14px 36px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.35)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '1.15rem 1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  <span>{item.q}</span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      color: '#8b5cf6',
                      display: 'inline-flex',
                    }}
                  >
                    <FiChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <div
                        style={{
                          padding: '0 1.2rem 1.2rem',
                          color: '#64748b',
                          lineHeight: 1.75,
                          fontSize: '0.96rem',
                        }}
                      >
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}