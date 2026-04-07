// components/cover/Home.tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiPlay } from 'react-icons/fi';

type HeroSlide = {
  id: number;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageUrl?: string;
  fallbackGradient: string;
  overlay: string;
};

const slides: HeroSlide[] = [
  {
    id: 1,
    eyebrow: 'Personal Trainer',
    title: 'Train Smarter With',
    highlight: 'Lena Cruz',
    description:
      'Custom fitness programs designed to help you build strength, confidence, and consistency without forcing your life around your workouts.',
    primaryLabel: 'Book a free consultation',
    primaryHref: '/contact',
    secondaryLabel: 'View training plans',
    secondaryHref: '/plans',
    imageUrl: 'https://storage.googleapis.com/fitbylena-profile-images/heros/hero.png',
    fallbackGradient: 'linear-gradient(135deg, #f4e7ff, #dfe7ff, #fdfcff)',
    overlay:
      'linear-gradient(to right, rgba(16,18,38,0.78), rgba(16,18,38,0.38), rgba(16,18,38,0.12))',
  },
  {
    id: 2,
    eyebrow: 'Strength & Conditioning',
    title: 'Build Real',
    highlight: 'Strength',
    description:
      'Structured coaching, progressive routines, and focused training plans built to keep you improving week after week.',
    primaryLabel: 'Start training',
    primaryHref: '/plans',
    secondaryLabel: 'See services',
    secondaryHref: '/about',
    fallbackGradient: 'linear-gradient(135deg, #ffe5ec, #f3e8ff, #f8fbff)',
    overlay:
      'linear-gradient(to right, rgba(40,20,35,0.72), rgba(40,20,35,0.34), rgba(40,20,35,0.08))',
  },
  {
    id: 3,
    eyebrow: 'Lifestyle Coaching',
    title: 'Fitness That Fits',
    highlight: 'Your Life',
    description:
      'No crash plans. No impossible routines. Just realistic coaching that works with your schedule, goals, and energy.',
    primaryLabel: 'Explore plans',
    primaryHref: '/plans',
    secondaryLabel: 'Meet Lena',
    secondaryHref: '/about',
    fallbackGradient: 'linear-gradient(135deg, #e7fff6, #e0f2fe, #f8fffc)',
    overlay:
      'linear-gradient(to right, rgba(15,40,34,0.72), rgba(15,40,34,0.34), rgba(15,40,34,0.08))',
  },
  {
    id: 4,
    eyebrow: 'Results Driven',
    title: 'Feel Better. Move Better.',
    highlight: 'Look Stronger.',
    description:
      'Build momentum with support, accountability, and personalized training that helps you stay motivated and see progress.',
    primaryLabel: 'Join now',
    primaryHref: '/login',
    secondaryLabel: 'See events',
    secondaryHref: '/events',
    fallbackGradient: 'linear-gradient(135deg, #fff1e6, #fff7ed, #eef4ff)',
    overlay:
      'linear-gradient(to right, rgba(45,28,18,0.72), rgba(45,28,18,0.34), rgba(45,28,18,0.08))',
  },
  {
    id: 5,
    eyebrow: 'Custom Programs',
    title: 'Train With More',
    highlight: 'Purpose',
    description:
      'From beginner plans to advanced progression, every workout path is designed to give you structure and confidence.',
    primaryLabel: 'View programs',
    primaryHref: '/plans',
    secondaryLabel: 'Book now',
    secondaryHref: '/contact',
    fallbackGradient: 'linear-gradient(135deg, #edf4ff, #e9e7ff, #f9fbff)',
    overlay:
      'linear-gradient(to right, rgba(20,24,52,0.72), rgba(20,24,52,0.34), rgba(20,24,52,0.08))',
  },
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);

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
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[index];
  const showImage = !!activeSlide.imageUrl && !failedImages[activeSlide.id];

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section
      style={{
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background: '#111',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${activeSlide.id}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: activeSlide.fallbackGradient,
            }}
          />
        </AnimatePresence>

        {showImage && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${activeSlide.id}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
              }}
            >
              <img
                src={activeSlide.imageUrl}
                alt={activeSlide.highlight}
                onError={() =>
                  setFailedImages((prev) => ({
                    ...prev,
                    [activeSlide.id]: true,
                  }))
                }
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeSlide.overlay,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            padding: isDesktop ? '0 3.5rem 0 7.25rem' : '0 1.25rem',
          }}
        >
          <motion.div
            key={`content-${activeSlide.id}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{
              maxWidth: '720px',
              color: '#fff',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              {activeSlide.eyebrow}
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                lineHeight: 0.96,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              {activeSlide.title}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #c084fc, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {activeSlide.highlight}
              </span>
            </h1>

            <p
              style={{
                marginTop: '1.25rem',
                marginBottom: '1.75rem',
                maxWidth: '620px',
                fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.88)',
              }}
            >
              {activeSlide.description}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                flexWrap: 'wrap',
                marginBottom: '2rem',
              }}
            >
              <a
                href={activeSlide.primaryHref}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.95rem 1.25rem',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                  border: 'none',
                  fontWeight: 700,
                  boxShadow: '0 12px 30px rgba(139,92,246,0.28)',
                }}
              >
                <FiCalendar size={16} />
                <span>{activeSlide.primaryLabel}</span>
              </a>

              <a
                href={activeSlide.secondaryHref}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.95rem 1.25rem',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  color: '#fff',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  fontWeight: 700,
                }}
              >
                <FiPlay size={16} />
                <span>{activeSlide.secondaryLabel}</span>
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                }}
              >
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <FiArrowLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <FiArrowRight size={18} />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    style={{
                      width: i === index ? 28 : 9,
                      height: 9,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      background:
                        i === index ? '#8b5cf6' : 'rgba(255,255,255,0.38)',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

{/*

export default function Home() {
  return (
    <section className="pt-lg-8 pt-6 py-xxl-10 pt-3">
      
      <div className="container">
        <div className="row d-flex align-items-center">
          <div className="col-xxl-5 col-lg-6 col-12">
            <div>
              <h5 className="text-muted mb-4">Personal Trainer</h5>
              <h1 className="mb-3 fw-bold">
                Hello, I&#39;m{" "}
                <span className="text-bottom-line">Lena Cruz,</span>
                Certified Fitness Coach
              </h1>
              <p className="par mb-4">
                Ready to transform your body and boost your confidence?
                I create custom fitness programs that fit your goals, schedule, and lifestyle.
              </p>
              <div className="d-grid d-lg-block">
                <a href="#" className="btn btn-sm">
                  Book a free consultation
                </a>
                <a
                  href="#"
                  className="btn btn-sm ms-lg-1 mt-2 mt-lg-0"
                >
                  View training plans
                </a>
              </div>
            </div>
          </div>
          <div className="col-xxl-6 offset-xxl-1 col-lg-6 col-12">
            <div className="text-center d-none d-lg-block fade-in">
              <img
                src="/images/admin/image.png"
                alt="Lena Cruz"
                className="img-fluid rounded"
              />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


*/}