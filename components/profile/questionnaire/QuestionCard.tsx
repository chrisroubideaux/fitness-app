// questionnaire/QuestionCard.tsx
'use client';
import { motion } from 'framer-motion';
import Select from 'react-select';
import {
  FaDumbbell,
  FaRunning,
  FaLeaf,
  FaHeartbeat,
  FaMale,
  FaFemale,
  FaUserGraduate,
  FaUser,
  FaHome,
  FaQuestion,
} from 'react-icons/fa';

type QuestionCardProps = {
  question: string;
  name: string;
  type?: string;
  options?: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => void;
};

export default function QuestionCard({
  question,
  name,
  type = 'text',
  options,
  value,
  onChange,
}: QuestionCardProps) {
  const getIcon = (opt: string) => {
    const lower = opt.toLowerCase();

    // Goals
    if (lower.includes('lose weight')) return <FaLeaf className="me-2 social-icon" />;
    if (lower.includes('build muscle')) return <FaDumbbell className="me-2 social-icon" />;
    if (lower.includes('endurance')) return <FaRunning className="me-2 social-icon" />;
    if (lower.includes('flexibility')) return <FaUser className="me-2 social-icon" />;
    if (lower.includes('maintain')) return <FaHeartbeat className="me-2 social-icon" />;
    if (lower.includes('event')) return <FaDumbbell className="me-2 social-icon" />;

    // Gender
    if (lower.includes('male')) return <FaMale className="me-2 social-icon" />;
    if (lower.includes('female')) return <FaFemale className="me-2 social-icon" />;

    // Activity level
    if (lower.includes('sedentary')) return <FaHome className="me-2 social-icon" />;
    if (lower.includes('moderate')) return <FaRunning className="me-2 social-icon" />;
    if (lower.includes('active')) return <FaDumbbell className="me-2 social-icon" />;

    // Experience level
    if (lower.includes('beginner')) return <FaUser className="me-2 social-icon" />;
    if (lower.includes('intermediate')) return <FaUserGraduate className="me-2 social-icon" />;
    if (lower.includes('advanced')) return <FaDumbbell className="me-2 social-icon" />;

    return <FaQuestion className="me-2 social-icon" />;
  };

  // ✅ react-select options with icons
  const formattedOptions =
    options?.map((opt) => ({
      value: opt,
      label: (
        <div className="d-flex align-items-center">
          {getIcon(opt)}
          <span>{opt}</span>
        </div>
      ),
    })) || [];

  return (
    <motion.div
      className="question-card mb-4 shadow-sm rounded-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h5 className="form-label fs-5">{question}</h5>

      {options ? (
        <Select
          name={name}
          options={formattedOptions}
          value={
            value
              ? {
                  value,
                  label: (
                    <div className="d-flex align-items-center">
                      {getIcon(value)}
                      <span>
                        {value} 
                      </span>
                    </div>
                  ),
                }
              : null
          }
          onChange={(selected) =>
            onChange({
              target: { name, value: (selected as { value: string }).value },
            } as { target: { name: string; value: string } })
          }
          classNamePrefix="custom-select"
          styles={{
            control: (base) => ({
              ...base,
              background: 'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
              color: 'gray',
              borderRadius: '0.5rem',
              padding: '2px',
            }),
            singleValue: (base) => ({
              ...base,
              color: 'gray',
            }),
            menu: (base) => ({
              ...base,
              background: 'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
              color: 'gray',
            }),
            option: (base, state) => ({
              ...base,
              background: state.isFocused
                ? 'rgba(255, 255, 255, 0.2)'
                : 'transparent',
              color: 'gray',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }),
          }}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="form-control"
          required
        />
      )}
    </motion.div>
  );
}



/*

// questionnaire/QuestionCard.tsx
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
      className=" question-card  mb-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h5 className="form-label fs-5">{question}</h5>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-select"
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
          className="form-control"
          required
        />
      )}
    </motion.div>
  );
}



*/  
