// components/about/MiniTestimonialsCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiMessageSquare } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Maria Lopez',
    role: 'Yoga Enthusiast',
    quote:
      'Lena’s sessions improved my flexibility and mental clarity. I look forward to every class!',
  },
  {
    name: 'David Kim',
    role: 'Busy Professional',
    quote:
      'The personalized programs fit perfectly into my hectic schedule. Results without stress!',
  },
  {
    name: 'Chloe Nguyen',
    role: 'First-time Gym Member',
    quote:
      'I used to feel lost in the gym. Now I feel empowered, supported, and confident.',
  },
  {
    name: 'James Carter',
    role: 'Athlete',
    quote:
      'The focus on strength and recovery has taken my performance to the next level.',
  },
];

export default function MiniTestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[index];

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
            maxWidth: '880px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{
              maxWidth: '700px',
              margin: '0 auto 2.75rem auto',
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
              Client Stories
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
              What clients say
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '1.05rem',
                lineHeight: 1.8,
              }}
            >
              Real feedback from people building strength, confidence, balance,
              and momentum with Lena’s coaching.
            </p>
          </motion.div>

          <div
            style={{
              position: 'relative',
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  padding: isDesktop ? '2rem' : '1.35rem',
                  borderRadius: 30,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.92))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow:
                    '0 18px 40px rgba(15,23,42,0.08), inset 0 0 0 1px rgba(255,255,255,0.35)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(91,209,215,0.12))',
                    color: '#8b5cf6',
                    fontSize: '1.2rem',
                  }}
                >
                  <FiMessageSquare />
                </div>

                <p
                  style={{
                    fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                    lineHeight: 1.9,
                    color: '#475569',
                    marginBottom: '1.35rem',
                  }}
                >
                  “{current.quote}”
                </p>

                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      color: '#111827',
                    }}
                  >
                    {current.name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: '#64748b',
                      fontSize: '0.92rem',
                    }}
                  >
                    {current.role}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div
              className="d-flex justify-content-center align-items-center flex-wrap"
              style={{
                gap: '0.9rem',
                marginTop: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1px solid rgba(139,92,246,0.14)',
                  background: 'rgba(255,255,255,0.75)',
                  color: '#8b5cf6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px rgba(15,23,42,0.06)',
                }}
              >
                <FiArrowLeft size={18} />
              </button>

              <div
                className="d-flex align-items-center"
                style={{
                  gap: '0.5rem',
                }}
              >
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    style={{
                      width: i === index ? 28 : 9,
                      height: 9,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      background:
                        i === index ? '#8b5cf6' : 'rgba(139,92,246,0.26)',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1px solid rgba(139,92,246,0.14)',
                  background: 'rgba(255,255,255,0.75)',
                  color: '#8b5cf6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px rgba(15,23,42,0.06)',
                }}
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
{/*

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Maria Lopez',
    role: 'Yoga Enthusiast',
    quote: 'Lena’s sessions improved my flexibility and mental clarity. I look forward to every class!',
  },
  {
    name: 'David Kim',
    role: 'Busy Professional',
    quote: 'The personalized programs fit perfectly into my hectic schedule. Results without stress!',
  },
  {
    name: 'Chloe Nguyen',
    role: 'First-time Gym Member',
    quote: 'I used to feel lost in the gym. Now I feel empowered, supported, and confident.',
  },
  {
    name: 'James Carter',
    role: 'Athlete',
    quote: 'The focus on strength and recovery has taken my performance to the next level.',
  },
];

export default function MiniTestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // 🔄 Auto-play effect
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[index];

  return (
    <section className="mini-testimonials py-5 shadow-lg">
      <div className="container text-center">
        <h1 className="fw-bold mb-4 fs-2 text-white">What Clients Say</h1>
        
        <div className="position-relative mx-auto" style={{ maxWidth: 600 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="testimonial-slide p-4 rounded shadow-sm"
            >
              <p className="testimonial-quote">“{current.quote}”</p>
              <h6 className="mt-3 mb-0">{current.name}</h6>
              <p className="text-muted small">{current.role}</p>
            </motion.div>
          </AnimatePresence>
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-outline-light btn-sm" onClick={prev}>←</button>
            <button className="btn btn-outline-light btn-sm" onClick={next}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

*/}
