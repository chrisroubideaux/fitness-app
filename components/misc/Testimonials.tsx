// components/misc/Testimonials.tsx
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
