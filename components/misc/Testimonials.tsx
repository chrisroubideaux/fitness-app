// components/misc/Testimonials.tsx
'use client';

import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    {
      avatar: 'https://i.pravatar.cc/150?img=12', // male
      name: 'Liam Carter',
      role: 'Elite Member',
      highlight: 'Best decision I made this year!',
      quote:
        'The AI-powered workouts keep me consistent and challenged. I’ve seen real strength gains in just 8 weeks. Highly recommend!',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=45', // female
      name: 'Sophia Reyes',
      role: 'Pro Member',
      highlight: 'Trainers who really care',
      quote:
        'Messaging my trainer directly keeps me accountable. It feels like I have a coach in my pocket at all times.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=25', // male
      name: 'Noah Patel',
      role: 'Free Plan User',
      highlight: 'Perfect for my busy schedule',
      quote:
        'The smart scheduling system fits around my work hours. No excuses anymore — I’m working out consistently.',
      rating: 4,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=47', // female
      name: 'Emma Zhang',
      role: 'Pro Member',
      highlight: 'Progress I can see',
      quote:
        'The analytics dashboard keeps me motivated. Seeing my progress in charts is way better than guessing.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=18', // male
      name: 'James Miller',
      role: 'Elite Member',
      highlight: 'Feels like personal training',
      quote:
        'The AI workouts are surprisingly accurate for my goals. It’s like having a personal trainer, but more affordable.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=56', // female
      name: 'Ava Thompson',
      role: 'Pro Member',
      highlight: 'Never felt stronger',
      quote:
        'In just 3 months, I’ve hit new PRs in squats and deadlifts. The structure and feedback make all the difference.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=19', // male
      name: 'Ethan Ross',
      role: 'Free Plan User',
      highlight: 'Great way to start fitness',
      quote:
        'I started with the free plan and already feel more active. It gave me the push I needed to finally stick with training.',
      rating: 4,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=57', // female
      name: 'Isabella Flores',
      role: 'Elite Member',
      highlight: 'Confidence booster',
      quote:
        'I’ve lost 10 pounds and gained muscle thanks to the structured workouts. I feel stronger and more confident than ever.',
      rating: 5,
    },
  ];

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
          <h2 className="mb-1">What Our Members Say</h2>
          <p className="text-muted">Real stories from our fitness community</p>
        </motion.div>

        <div className="row g-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="testimonial-card h-100">
                <p className="testimonial-highlight">{t.highlight}</p>

                {/* ⭐ Star rating */}
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
        </div>
      </div>
    </section>
  );
}
