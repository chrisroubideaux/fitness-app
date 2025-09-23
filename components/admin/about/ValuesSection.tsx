// components/about/ValuesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { FaDumbbell, FaBalanceScale, FaClock, FaBrain } from 'react-icons/fa';

export default function ValuesSection() {
  const values = [
    {
      icon: <FaClock className='value-icon' />,
      title: 'Consistency',
      description: 'Commitment every day builds long-term success.',
    },
    {
      icon: <FaDumbbell className='value-icon' />,
      title: 'Strength',
      description: 'True strength is built in body, mind, and spirit.',
    },
    {
      icon: <FaBalanceScale className='value-icon' />,
      title: 'Balance',
      description: 'Fitness that supports—not disrupts—your lifestyle.',
    },
    {
      icon: <FaBrain className='value-icon' />,
      title: 'Mindset',
      description: 'Growth comes from discipline, focus, and positivity.',
    },
  ];

  return (
    <section className="values-section py-5 shadow-lg">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="fw-bold mb-3">Core Values</h2>
          <p className="text-white">
            The principles that guide every training session and every success story.
          </p>
        </motion.div>

        <div className="row g-4">
          {values.map((value, i) => (
            <motion.div
              key={i}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="value-card text-center p-4 h-100">
                <div className="value-icon mb-3">{value.icon}</div>
                <h5 className="fw-semibold">{value.title}</h5>
                <p className="text-muted small">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
