// components/about/MiniTestimonialsCarousel.tsx
// components/about/MiniTestimonialsCarousel.tsx
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
    <section className="mini-testimonials py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">What Clients Say</h2>
        
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

          {/* Controls (still optional for users) */}
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-outline-light btn-sm" onClick={prev}>←</button>
            <button className="btn btn-outline-light btn-sm" onClick={next}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

