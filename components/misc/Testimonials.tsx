// components/misc/Testimonials.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

export default function Testimonials() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonials = [
    {
      avatar:
        'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Liam Carter',
      role: 'Elite Member',
      highlight: 'Best decision I made this year!',
      quote:
        'The AI-powered workouts keep me consistent and challenged. I’ve seen real strength gains in just 8 weeks. Highly recommend!',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Sophia Reyes',
      role: 'Pro Member',
      highlight: 'Trainers who really care',
      quote:
        'Messaging my trainer directly keeps me accountable. It feels like I have a coach in my pocket at all times.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Noah Patel',
      role: 'Free Plan User',
      highlight: 'Perfect for my busy schedule',
      quote:
        'The smart scheduling system fits around my work hours. No excuses anymore — I’m working out consistently.',
      rating: 4,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Emma Zhang',
      role: 'Pro Member',
      highlight: 'Progress I can see',
      quote:
        'The analytics dashboard keeps me motivated. Seeing my progress in charts is way better than guessing.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'James Miller',
      role: 'Elite Member',
      highlight: 'Feels like personal training',
      quote:
        'The AI workouts are surprisingly accurate for my goals. It’s like having a personal trainer, but more affordable.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Ava Thompson',
      role: 'Pro Member',
      highlight: 'Never felt stronger',
      quote:
        'In just 3 months, I’ve hit new PRs in squats and deadlifts. The structure and feedback make all the difference.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Ethan Ross',
      role: 'Free Plan User',
      highlight: 'Great way to start fitness',
      quote:
        'I started with the free plan and already feel more active. It gave me the push I needed to finally stick with training.',
      rating: 4,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Isabella Flores',
      role: 'Elite Member',
      highlight: 'Confidence booster',
      quote:
        'I’ve lost 10 pounds and gained muscle thanks to the structured workouts. I feel stronger and more confident than ever.',
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' },
    },
  };

  return (
    <section
      style={{
        width: '100%',
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background:
          'linear-gradient(135deg, #f8f4ff 0%, #eef7ff 45%, #fdfcff 100%)',
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
          background: 'rgba(139,92,246,0.10)',
          filter: 'blur(46px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: isDesktop ? '90px' : '-50px',
          width: 250,
          height: 250,
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
            Testimonials
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
            What our members are saying
          </h2>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            Real stories from people building better habits, better strength,
            and more confidence with FitByLena.
          </p>
        </motion.div>

        <motion.div
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="col-12 col-md-6 col-xl-3"
              variants={cardVariants}
            >
              <motion.div
                style={{
                  height: '100%',
                  padding: '1.35rem',
                  borderRadius: 28,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow:
                    '0 16px 38px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                  boxShadow:
                    '0 24px 55px rgba(15,23,42,0.12), 0 0 0 1px rgba(139,92,246,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div>
                  <div
                    className="d-flex align-items-start justify-content-between gap-3"
                    style={{ marginBottom: '1rem' }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.42rem 0.72rem',
                        borderRadius: 999,
                        background: 'rgba(139,92,246,0.10)',
                        color: '#8b5cf6',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {t.role}
                    </span>

                    <motion.span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        background: 'rgba(15,23,42,0.04)',
                        color: '#64748b',
                      }}
                      whileHover={{
                        rotate: 8,
                        scale: 1.08,
                        background: 'rgba(139,92,246,0.12)',
                        color: '#8b5cf6',
                      }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <FiArrowUpRight size={16} />
                    </motion.span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: '#111827',
                      marginBottom: '0.75rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {t.highlight}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      marginBottom: '0.9rem',
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.95rem',
                          opacity: idx < t.rating ? 1 : 0.28,
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>

                  <p
                    style={{
                      color: '#475569',
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      marginBottom: 0,
                    }}
                  >
                    “{t.quote}”
                  </p>
                </div>

                <div
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(148,163,184,0.12)',
                  }}
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.2,
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.88rem',
                        marginTop: 4,
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


{/*
'use client';

import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    {
      avatar:
        'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Liam Carter',
      role: 'Elite Member',
      highlight: 'Best decision I made this year!',
      quote:
        'The AI-powered workouts keep me consistent and challenged. I’ve seen real strength gains in just 8 weeks. Highly recommend!',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Sophia Reyes',
      role: 'Pro Member',
      highlight: 'Trainers who really care',
      quote:
        'Messaging my trainer directly keeps me accountable. It feels like I have a coach in my pocket at all times.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Noah Patel',
      role: 'Free Plan User',
      highlight: 'Perfect for my busy schedule',
      quote:
        'The smart scheduling system fits around my work hours. No excuses anymore — I’m working out consistently.',
      rating: 4,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Emma Zhang',
      role: 'Pro Member',
      highlight: 'Progress I can see',
      quote:
        'The analytics dashboard keeps me motivated. Seeing my progress in charts is way better than guessing.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'James Miller',
      role: 'Elite Member',
      highlight: 'Feels like personal training',
      quote:
        'The AI workouts are surprisingly accurate for my goals. It’s like having a personal trainer, but more affordable.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Ava Thompson',
      role: 'Pro Member',
      highlight: 'Never felt stronger',
      quote:
        'In just 3 months, I’ve hit new PRs in squats and deadlifts. The structure and feedback make all the difference.',
      rating: 5,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Ethan Ross',
      role: 'Free Plan User',
      highlight: 'Great way to start fitness',
      quote:
        'I started with the free plan and already feel more active. It gave me the push I needed to finally stick with training.',
      rating: 4,
    },
    {
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&crop=faces',
      name: 'Isabella Flores',
      role: 'Elite Member',
      highlight: 'Confidence booster',
      quote:
        'I’ve lost 10 pounds and gained muscle thanks to the structured workouts. I feel stronger and more confident than ever.',
      rating: 5,
    },
  ];

  // 🔥 Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // wave effect
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="testimonials-section">
      <div className="container py-5">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-1 fs-2">What Our Members Say</h1>
          <p className="text-muted">Real stories from our fitness community</p>
        </motion.div>

        <motion.div
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="col-md-6 col-lg-3"
              variants={cardVariants}
            >
              <div className="testimonial-card h-100">
                <p className="testimonial-highlight">{t.highlight}</p>

                <div className="testimonial-stars mb-2">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <span key={idx} className="star">⭐</span>
                  ))}
                </div>

                <p className="testimonial-quote">“{t.quote}”</p>
                <div className="d-flex align-items-center mt-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="testimonial-avatar me-3"
                  />
                  <div>
                    <strong>{t.name}</strong>
                    <p className="text-muted small mb-0">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

*/}
