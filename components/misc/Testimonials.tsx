// components/misc/Testimonials.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Testimonial = {
  avatar: string;
  name: string;
  role: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    avatar: 'https://i.pravatar.cc/150?img=11',
    name: 'Liam Carter',
    role: 'Elite Member',
    quote:
      'The AI workouts are uncanny — it feels like I have a personal trainer who knows me better than I do.',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=32',
    name: 'Sophia Reyes',
    role: 'Pro Member',
    quote:
      'Messaging trainers directly has kept me accountable. I’ve never been this consistent before!',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=48',
    name: 'Noah Patel',
    role: 'Free Plan User',
    quote:
      'Even on the free plan I’m seeing results. The upgrade options are tempting, and I’ll probably switch soon.',
  },
  {
    avatar: 'https://i.pravatar.cc/150?img=65',
    name: 'Emma Zhang',
    role: 'Pro Member',
    quote:
      'The analytics and progress tracking give me real motivation. Watching the charts go up is addictive!',
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[index];

  return (
    <section className="container testimonials-section">
      <div className="text-center mb-5">
        <h2 className="mb-1">What Our Members Say</h2>
        <p className="text-muted">Real feedback from real people</p>
      </div>

      <div className="testimonial-slider">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="testimonial-card"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={current.avatar}
              alt={current.name}
              className="testimonial-avatar"
            />
            <p className="testimonial-quote">“{current.quote}”</p>
            <div className="testimonial-footer">
              <strong>{current.name}</strong>
              <span className="text-muted">{current.role}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider dots */}
      <div className="testimonial-dots">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
