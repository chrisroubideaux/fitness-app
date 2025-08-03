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
