// questionnaire/WorkoutModal.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import QuestionCard from './QuestionCard';
//import { FaDumbbell, FaHeartbeat, FaWalking } from 'react-icons/fa';

const steps = [
  { name: 'goal', question: 'What is your fitness goal?' },
  { name: 'age', question: 'What is your age?', type: 'number' },
  { name: 'gender', question: 'What is your gender?', options: ['Male', 'Female'] },
  { name: 'weight', question: 'What is your weight (lbs)?', type: 'number' },
  { name: 'height', question: 'What is your height (inches)?', type: 'number' },
  { name: 'activity_level', question: 'Your activity level?', options: ['Sedentary', 'Moderate', 'Active'] },
  { name: 'experience_level', question: 'Your experience level?', options: ['Beginner', 'Intermediate', 'Advanced'] },
];

export default function WorkoutModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    experience_level: '',
  });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  const current = steps[currentStep];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('No auth token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-workout', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlan(res.data.workout_plan);
      setShowPlan(true);                // ✅ Show plan modal
      localStorage.setItem('hasCompletedQuestionnaire', 'true');
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Failed to generate workout plan.');
    }

    setLoading(false);
  };

  const renderFormattedPlan = () => {
    const lines = plan.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('**Week')) {
        return (
          <h5 key={`week-${idx}`} className="fw-bold text-primary mt-3">
            📅 {trimmed.replace(/\*\*/g, '')}
          </h5>
        );
      }

      if (trimmed.startsWith('Day')) {
        return (
          <p key={`day-${idx}`} className="fw-semibold mb-1">
            📆 {trimmed}
          </p>
        );
      }

      if (trimmed.toLowerCase().includes('rest')) {
        return <p key={`rest-${idx}`}>🚶‍♂️ {trimmed}</p>;
      }

      if (trimmed.toLowerCase().includes('cardio')) {
        return <p key={`cardio-${idx}`}>❤️ {trimmed}</p>;
      }

      if (trimmed.startsWith('-')) {
        return <p key={`entry-${idx}`}>💪 {trimmed}</p>;
      }

      return <p key={`plain-${idx}`}>{trimmed}</p>;
    });
  };

  return (
    <div className="modal-overlay">
      {/* Questionnaire Modal */}
      <AnimatePresence>
        {!showPlan && (
          <motion.div
            key="questionnaire"
            className="modal-content bg-gradient p-4 rounded shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <QuestionCard
              key={current.name}
              name={current.name}
              question={current.question}
              type={current.type}
              options={current.options}
              value={formData[current.name as keyof typeof formData]}
              onChange={handleChange}
            />

            <button
              onClick={nextStep}
              className="btn btn-primary mt-3"
              disabled={loading}
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Output Modal */}
      <AnimatePresence>
        {showPlan && (
          <motion.div
            key="plan"
            className="modal-content p-4 bg-light rounded shadow-lg"
            style={{ width: '400px', maxHeight: '500px', overflowY: 'auto' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
          >
         <button className="btn-close float-end" onClick={() => setShowPlan(false)} />



            <h4 className="mb-3">Your AI-Powered Workout Plan</h4>
            <div>{renderFormattedPlan()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



/*
'use client';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import QuestionCard from './QuestionCard';

const steps = [
  { name: 'goal', question: 'What is your fitness goal?' },
  { name: 'age', question: 'What is your age?', type: 'number' },
  { name: 'gender', question: 'What is your gender?', options: ['Male', 'Female'] },
  { name: 'weight', question: 'What is your weight (lbs)?', type: 'number' },
  { name: 'height', question: 'What is your height (inches)?', type: 'number' },
  { name: 'activity_level', question: 'Your activity level?', options: ['Sedentary', 'Moderate', 'Active'] },
  { name: 'experience_level', question: 'Your experience level?', options: ['Beginner', 'Intermediate', 'Advanced'] },
];

export default function WorkoutModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    experience_level: '',
  });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const current = steps[currentStep];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const token = localStorage.getItem('authToken'); // ✅ Fresh fetch

    if (!token) {
      alert("No auth token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-workout', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(res.data.workout_plan);
      localStorage.setItem('hasCompletedQuestionnaire', 'true');
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Failed to generate workout plan.');
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={current.name}
            name={current.name}
            question={current.question}
            type={current.type}
            options={current.options}
            value={formData[current.name as keyof typeof formData]}
            onChange={handleChange}
          />
        </AnimatePresence>

        <button
          onClick={nextStep}
          className="next-button"
          disabled={loading}
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </button>

        {plan && (
          <div className="plan-output">
            <h3>Your Plan:</h3>
            <pre>{plan}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

*/
