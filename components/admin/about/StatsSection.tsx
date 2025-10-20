// components/about/StatsSection.tsx
// components/about/StatsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { FaUsers, FaDumbbell, FaGlobeAmericas, FaSmile } from 'react-icons/fa';

type StatItem = {
  icon: React.ReactElement;
  label: string;
  value: number;
  suffix?: string;
};

export default function StatsSection() {
  const stats: StatItem[] = [
    { icon: <FaUsers />, label: 'Clients Trained', value: 500, suffix: '+' },
    { icon: <FaDumbbell />, label: 'Workouts Completed', value: 10000, suffix: '+' },
    { icon: <FaGlobeAmericas />, label: 'Countries Reached', value: 20, suffix: '+' },
    { icon: <FaSmile />, label: 'Satisfaction Rate', value: 95, suffix: '%' },
  ];

  return (
    <section className="stats-section py-5 shadow-sm ">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="fw-bold mb-3 fs-2">Our Impact</h1>
          <p className="text-muted">Numbers that showcase our journey</p>
        </motion.div>

        <div className="row g-4 text-center justify-content-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="col-6 col-md-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="stat-item">
                <div className="stat-icon mb-2">{s.icon}</div>
                <h1 className="stat-value">
                  {s.value.toLocaleString()}
                  {s.suffix}
                </h1>
                <p className="stat-label">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
