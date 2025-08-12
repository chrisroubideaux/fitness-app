// Profile Page/User[id]/page.tsx
// app/profile/[id]/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/profile/sidebar/Sidebar';

// Define SidebarTab type here to include all tab values used
type SidebarTab = 'calendar' | 'notifications' | 'messages' | 'WorkoutPlan' | 'dashboard' | 'progress' | 'goals' | 'ai' | 'settings';
import CalendarComponent from '@/components/profile/calendar/Calendar';
import MessagesPanel from '@/components/profile/messages/MessagesPanel';
import NotificationsPanel from '@/components/profile/messages/NotificationsPanel';
import WorkoutPlan from '@/components/profile/charts/WorkoutPlan'; // <— add this import (adjust path if needed)
import WeeklyProgressChart from '@/components/profile/charts/WeeklyProgressChart';



import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

const WorkoutModal = dynamic<{ onClose: () => void }>(
  () => import('@/components/profile/questionnaire/WorkoutModal'),
  { ssr: false }
);

type User = {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  address?: string;
  phone?: string;
  profile_image_url?: string;
  membership_plan_id?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ✔ include WorkoutPlan in the union
  const [activeTab, setActiveTab] = useState<SidebarTab>('calendar');

  const notificationCount = 3; // Static for now

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) localStorage.setItem('authToken', tokenFromURL);

    const token = tokenFromURL || localStorage.getItem('authToken');
    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const data = await res.json();
        setUser(data);

        const hasCompleted = localStorage.getItem('hasCompletedQuestionnaire');
        if (!hasCompleted) setShowModal(true);
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarComponent />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'messages':
        return <MessagesPanel />;
      case 'WorkoutPlan': // ← exactly as requested
        return <WorkoutPlan />;
      case 'dashboard':
      case 'progress':
      return (
        <WeeklyProgressChart
          apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
          tz="America/Chicago"
        />
      );
      case 'goals':
      case 'ai':
      case 'settings':
      default:
        return null;
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}><h2>Loading profile...</h2></div>;

  if (error || !user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading profile</h2>
        <p>{error || 'User not found.'}</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="layout h-100">
      <div className="container-fluid">
        <div className="container-fluid py-3">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-4 col-xxl-3 mb-4">
              <Sidebar
                userId={user.id}
                userName={user.full_name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
              />
            </div>

            {/* Main Content */}
            <div className="col-lg-8 col-xxl-9">
              {showModal && (
                <WorkoutModal
                  onClose={() => {
                    localStorage.setItem('hasCompletedQuestionnaire', 'true');
                    setShowModal(false);
                  }}
                />
              )}

              {/* (Optional) Top tab buttons — keep or remove */}
              <div className="mb-4 position-relative">
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  <button
                    className={`btn btn-sm btn-${activeTab === 'calendar' ? 'primary' : 'outline-primary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}
                    onClick={() => setActiveTab('calendar')}
                  >
                    <FaCalendarAlt className="me-2" style={{ fontSize: '0.9rem' }} />
                    Calendar
                  </button>

                  <button
  className={`btn btn-sm btn-${activeTab === 'notifications' ? 'primary' : 'outline-primary'} position-relative`}
  style={{ padding: '4px 10px', fontSize: '0.8rem', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}
  onClick={() => setActiveTab('notifications')}
>
  <IoNotificationsOutline className="me-2" style={{ fontSize: '0.9rem' }} />
  Notifications
  {notificationCount > 0 && (
    <span
      className="badge bg-danger ms-2"
      style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}
    >
      {notificationCount}
    </span>
  )}
</button>


                  <button
                    className={`btn btn-sm btn-${activeTab === 'messages' ? 'primary' : 'outline-primary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}
                    onClick={() => setActiveTab('messages')}
                  >
                    <FaComments className="me-2" style={{ fontSize: '0.9rem' }} />
                    Messages
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'WorkoutPlan' ? 'primary' : 'outline-primary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}
                    onClick={() => setActiveTab('WorkoutPlan')}
                  >
                    🏋️ Workout Plan
                  </button>
                </div>
              </div>

              {/* Animated Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="calendarContainer"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



/*

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState,  } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/profile/sidebar/Sidebar';
import CalendarComponent from '@/components/profile/calendar/Calendar';
import MessagesPanel from '@/components/profile/messages/MessagesPanel';
import NotificationsPanel from '@/components/profile/messages/NotificationsPanel';      

import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5'; // Notification icon

const WorkoutModal = dynamic<{ onClose: () => void }>(
  () => import('@/components/profile/questionnaire/WorkoutModal'),
  { ssr: false }
);

type User = {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  address?: string;
  phone?: string;
  profile_image_url?: string;
  membership_plan_id?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'notifications' | 'messages'>('calendar');

  const notificationCount = 3; // Static for now

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) {
      localStorage.setItem('authToken', tokenFromURL);
    }

    const token = tokenFromURL || localStorage.getItem('authToken');
    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        setUser(data);

        const hasCompleted = localStorage.getItem('hasCompletedQuestionnaire');
        if (!hasCompleted) {
          setShowModal(true);
        }
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarComponent />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'messages':
        return <MessagesPanel />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading profile</h2>
        <p>{error || 'User not found.'}</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="layout h-100">
      <div className="container-fluid">
        <div className="container-fluid py-3">
          <div className="row">
          
            <div className="col-lg-4 col-xxl-3 mb-4">
              <Sidebar userId={user.id} userName={user.full_name} onLogout={handleLogout} />
            </div>

           
            <div className="col-lg-8 col-xxl-9">
              {showModal && (
                <WorkoutModal
                  onClose={() => {
                    localStorage.setItem('hasCompletedQuestionnaire', 'true');
                    setShowModal(false);
                  }}
                />
              )}

             
              <div className="mb-4 position-relative">
                <div className="d-flex justify-content-center flex-wrap gap-2">
                
                  <button
                    className={`btn btn-sm btn-${activeTab === 'calendar' ? 'primary' : 'outline-primary'}`}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => setActiveTab('calendar')}
                  >
                    <FaCalendarAlt className="me-2" style={{ fontSize: '0.9rem' }} />
                    Calendar
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'notifications' ? 'primary' : 'outline-primary'} position-relative`}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <IoNotificationsOutline className="me-2" style={{ fontSize: '0.9rem' }} />
                    Notifications
                    {notificationCount > 0 && (
                      <span
                        className="badge bg-danger ms-2"
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {notificationCount}
                      </span>
                    )}
                  </button>

                 
                  <button
                    className={`btn btn-sm btn-${activeTab === 'messages' ? 'primary' : 'outline-primary'}`}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => setActiveTab('messages')}
                  >
                    <FaComments className="me-2" style={{ fontSize: '0.9rem' }} />
                    Messages
                  </button>
                </div>
              </div>

            
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="calendarContainer"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






*/