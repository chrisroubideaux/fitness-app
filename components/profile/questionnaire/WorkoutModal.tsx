// questionnaire/WorkoutModal.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import QuestionCard from './QuestionCard';

const steps = [
  {
    name: 'goal',
    question: 'What is your fitness goal?',
    options: [
      'Lose weight',
      'Build muscle',
      'Improve endurance',
      'Increase flexibility',
      'Maintain health',
      'Train for an event',
    ],
  },
  { name: 'age', question: 'What is your age?', type: 'number' },
  { name: 'gender', question: 'What is your gender?', options: ['Male', 'Female'] },
  { name: 'weight', question: 'What is your weight (lbs)?', type: 'number' },
  { name: 'height_feet', question: 'Height (feet)', options: ['4', '5', '6', '7'] },
  { name: 'height_inches', question: 'Height (inches)', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] },
  {
    name: 'activity_level',
    question: 'Your activity level?',
    options: ['Sedentary', 'Moderate', 'Active'],
  },
  {
    name: 'experience_level',
    question: 'Your experience level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
];

export default function WorkoutModal() {
  const [isModalOpen, setIsModalOpen] = useState(true); // ✅ Control full modal visibility
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    gender: '',
    weight: '',
    height_feet: '',
    height_inches: '',
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

    const totalHeight =
      parseInt(formData.height_feet || '0') * 12 +
      parseInt(formData.height_inches || '0');

    const payload: Omit<typeof formData, 'height_feet' | 'height_inches'> & { height: string } = {
      ...formData,
      height: totalHeight.toString(),
    };

    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-workout', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlan(res.data.workout_plan);
      setShowPlan(true);
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Failed to generate workout plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false); // ✅ Fully close modal
    setShowPlan(false);
    setCurrentStep(0);
    setFormData({
      goal: '',
      age: '',
      gender: '',
      weight: '',
      height_feet: '',
      height_inches: '',
      activity_level: '',
      experience_level: '',
    });
    setPlan('');
  };

  const renderFormattedPlan = () => {
    const lines = plan.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('**Week')) {
        return (
          <li key={`week-${idx}`} className="list-group-item fw-bold text-primary bg-light">
            📅 {trimmed.replace(/\*\*/g, '')}
          </li>
        );
      }

      if (trimmed.startsWith('Day')) {
        return (
          <li key={`day-${idx}`} className="list-group-item fw-semibold">
            📆 {trimmed}
          </li>
        );
      }

      if (trimmed.toLowerCase().includes('rest')) {
        return (
          <li key={`rest-${idx}`} className="list-group-item">
            🚶‍♂️ {trimmed}
          </li>
        );
      }

      if (trimmed.toLowerCase().includes('cardio')) {
        return (
          <li key={`cardio-${idx}`} className="list-group-item">
            ❤️ {trimmed}
          </li>
        );
      }

      if (trimmed.startsWith('-')) {
        return (
          <li key={`entry-${idx}`} className="list-group-item">
            💪 {trimmed}
          </li>
        );
      }

      return (
        <li key={`plain-${idx}`} className="list-group-item">
          {trimmed}
        </li>
      );
    });
  };

  return (
    <>
      {isModalOpen && (
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
                className="modal-content p-4 shadow border"
                style={{
                  width: '450px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  borderRadius: '0.25rem',
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.4 }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <h4 className="mb-3">Your AI-Powered Workout Plan</h4>
                  <button className="btn-close" onClick={handleClose} />
                </div>

                {loading ? (
                  <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="spinner-border text-primary mb-2" role="status" />
                    <span className="text-muted">Generating your plan...</span>
                  </div>
                ) : (
                  <>
                    <ul className="list-group list-group-flush mb-3">
                      {renderFormattedPlan()}
                    </ul>
                    <button className="btn btn-outline-secondary w-100" onClick={handleClose}>
                      Close and return to profile
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}


/*

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import QuestionCard from './QuestionCard';

const steps = [
  {
    name: 'goal',
    question: 'What is your fitness goal?',
    options: [
      'Lose weight',
      'Build muscle',
      'Improve endurance',
      'Increase flexibility',
      'Maintain health',
      'Train for an event',
    ],
  },
  { name: 'age', question: 'What is your age?', type: 'number' },
  { name: 'gender', question: 'What is your gender?', options: ['Male', 'Female'] },
  { name: 'weight', question: 'What is your weight (lbs)?', type: 'number' },
  { name: 'height_feet', question: 'Height (feet)', options: ['4', '5', '6', '7'] },
  { name: 'height_inches', question: 'Height (inches)', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] },
  {
    name: 'activity_level',
    question: 'Your activity level?',
    options: ['Sedentary', 'Moderate', 'Active'],
  },
  {
    name: 'experience_level',
    question: 'Your experience level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
];

export default function WorkoutModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    gender: '',
    weight: '',
    height_feet: '',
    height_inches: '',
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

    const totalHeight =
      parseInt(formData.height_feet || '0') * 12 +
      parseInt(formData.height_inches || '0');

    const payload: Omit<typeof formData, 'height_feet' | 'height_inches'> & { height: string } = {
      ...formData,
      height: totalHeight.toString(),
    };


    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-workout', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlan(res.data.workout_plan);
      setShowPlan(true);
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
          <li key={`week-${idx}`} className="list-group-item fw-bold text-primary bg-light">
         
          </li>
        );
      }

      if (trimmed.startsWith('Day')) {
        return (
          <li key={`day-${idx}`} className="list-group-item fw-semibold">
            📆 {trimmed}
          </li>
        );
      }

      if (trimmed.toLowerCase().includes('rest')) {
        return (
          <li key={`rest-${idx}`} className="list-group-item">
            🚶‍♂️ {trimmed}
          </li>
        );
      }

      if (trimmed.toLowerCase().includes('cardio')) {
        return (
          <li key={`cardio-${idx}`} className="list-group-item">
            ❤️ {trimmed}
          </li>
        );
      }

      if (trimmed.startsWith('-')) {
        return (
          <li key={`entry-${idx}`} className="list-group-item">
            💪 {trimmed}
          </li>
        );
      }

      return (
        <li key={`plain-${idx}`} className="list-group-item">
          {trimmed}
        </li>
      );
    });
  };

  return (
    <div className="modal-overlay">
    
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

     
      <AnimatePresence>
       {showPlan && (
  <motion.div
    key="plan"
    className="modal-content p-4 shadow border"
    style={{
      width: '450px',
      maxHeight: '500px',
      overflowY: 'auto',
      borderRadius: '0.25rem',
    }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.4 }}
  >
    <div className="d-flex justify-content-between align-items-start">
      <h4 className="mb-3">Your AI-Powered Workout Plan</h4>
      <button className="btn-close" onClick={() => setShowPlan(false)} />
    </div>

    {loading ? (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary mb-2" role="status" />
        <span className="text-muted">Generating your plan...</span>
      </div>
    ) : (
      <>
        <ul className="list-group list-group-flush mb-3">
          {renderFormattedPlan()}
        </ul>

        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => {
            setShowPlan(false);
            setCurrentStep(0);
            setFormData({
              goal: '',
              age: '',
              gender: '',
              weight: '',
              height_feet: '',
              height_inches: '',
              activity_level: '',
              experience_level: '',
            });
            setPlan('');
          }}
        >
          Close and return to profile
        </button>
      </>
    )}
  </motion.div>
)}


        
      </AnimatePresence>
    </div>
  );
}


 📅 {trimmed.replace(/g, '')} 
*/
