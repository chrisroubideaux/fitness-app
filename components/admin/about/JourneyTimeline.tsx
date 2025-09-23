// components/about/JourneyTimeline.tsx

'use client';

import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

export default function JourneyTimeline() {
  const milestones = [
    {
      year: '2015',
      title: 'Certified Personal Trainer',
      description: 'Became officially certified and started helping clients transform their fitness.',
    },
    {
      year: '2017',
      title: 'Expanded into Nutrition Coaching',
      description: 'Added personalized meal plans and holistic wellness to training programs.',
    },
    {
      year: '2020',
      title: 'FitByLena Community',
      description: 'Launched an online community to connect and inspire fitness enthusiasts worldwide.',
    },
    {
      year: '2025',
      title: 'AI-Powered Training',
      description: 'Introduced smart, personalized AI coaching to empower clients anywhere, anytime.',
    },
  ];

  return (
    <section className="journey-section py-5 shadow-lg">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="fw-bold mb-3 fs-2">My Journey</h1>
          <p className="text-muted">
            The milestones that shaped my path as a trainer and wellness coach.
          </p>
        </motion.div>

        <div className="timeline">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              className="timeline-item"
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="timeline-icon">
                <FaCheckCircle />
              </div>
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <h5 className="fw-semibold">{m.title}</h5>
                <p className="small text-muted">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
