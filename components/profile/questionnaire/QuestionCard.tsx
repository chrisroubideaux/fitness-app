'use client';

import { motion } from 'framer-motion';


type QuestionCardProps = {
  question: string;
  name: string;
  type?: string;
  options?: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export default function QuestionCard({
  question,
  name,
  type = 'text',
  options,
  value,
  onChange
}: QuestionCardProps) {
  return (
    <motion.div
      className="question-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="question-title">{question}</h2>

      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="question-input"
          required
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="question-input"
          required
        />
      )}
    </motion.div>
  );
}
