// Workout Plan Chart
'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface WorkoutPlan {
  id: string;
  content: string;
  created_at: string;
}

export default function WorkoutPlanViewer() {
  const [latestPlan, setLatestPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Missing token');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/ai/my-workout-plans', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        if (data.workout_plans && data.workout_plans.length > 0) {
          setLatestPlan(data.workout_plans[0]);
        } else {
          setError('No workout plans found.');
        }
      } catch (err) {
        console.error('Failed to fetch workout plan:', err);
        setError('Unable to fetch plan.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  const renderMarkdown = (markdown: string) => {
    const html = markdown
      .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, '<ul>$&</ul>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    return DOMPurify.sanitize(html);
  };

  if (loading) return <div className="p-3">Loading your workout plan...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!latestPlan) return null;

  return (
    <div className="workout-plan-viewer p-3  shadow-sm">
      <div className="mt-3 pt-3">
      <h5 className="mb-3 text-bold">📋 Your Workout Plan</h5>
      <p className=" small mb-2">
        Last Updated: {new Date(latestPlan.created_at).toLocaleString()}
      </p>
      <div
        className="text-body small"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(latestPlan.content) }}
      />
      </div>
    </div>
  );
}
