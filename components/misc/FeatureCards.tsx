// components/misc/FeatureCards.tsx
'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '💪',
    title: 'AI-Powered Workouts',
    description: 'Personalized training plans created just for you using AI.',
  },
  {
    icon: '🗓️',
    title: 'Smart Scheduling',
    description: 'Easily book, reschedule, and track all your sessions.',
  },
  {
    icon: '💬',
    title: 'Direct Messaging',
    description: 'Chat with trainers and stay accountable every day.',
  },
  {
    icon: '📊',
    title: 'Analytics & Progress',
    description: 'Track your stats and improvements with real-time charts.',
  },
];

export default function FeatureCards() {
  return (
    <section className="container py-5">
      <div className="text-center mb-4">
        <h1 className="mb-1">Features</h1>
        <p className="par">Everything you need to reach your goals</p>
      </div>

      <div className="row g-4 featurecards-grid mt-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="col-md-3"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <div className="featurecards-card">
              <div className="featurecards-icon">{f.icon}</div>
              <h5 className="mt-3">{f.title}</h5>
              <p className="text-muted">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
