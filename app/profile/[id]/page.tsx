// app/profile/[id]/page.tsx
'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import Sidebar from '@/components/profile/sidebar/Sidebar';
import CalendarComponent from '@/components/profile/calendar/Calendar';
import MessagesPanel from '@/components/profile/messages/MessagesPanel';
import NotificationsPanel from '@/components/profile/messages/NotificationsPanel';
import WorkoutPlan from '@/components/profile/charts/WorkoutPlan';
import WeeklyProgressChart from '@/components/profile/charts/WeeklyProgressChart';
import MembershipsPanel from '@/components/profile/memberships/MembershipsPanel';
import BioCard, { type User as BioUser } from '@/components/profile/bio/BioCard';

import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

const WorkoutModal = dynamic<{ onClose: () => void }>(
  () => import('@/components/profile/questionnaire/WorkoutModal'),
  { ssr: false }
);

type SidebarTab =
  | 'calendar'
  | 'notifications'
  | 'messages'
  | 'WorkoutPlan'
  | 'dashboard'
  | 'progress'
  | 'memberships'
  | 'ai'
  | 'settings';

type PageUser = {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  membership_plan_id?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const routeId = params?.id as string | undefined;

  const [user, setUser] = useState<PageUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<SidebarTab>('calendar');
  const notificationCount = 3;

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) {
      localStorage.setItem('authToken', tokenFromURL);
    }

    const token = tokenFromURL || localStorage.getItem('authToken');
    setAuthToken(token);

    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }

    (async () => {
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
        setUser(data as PageUser);

        // ✅ Ensure URL id matches token user id
        if (routeId && data.id && routeId !== data.id) {
          console.warn('⚠️ URL id and token user id mismatch. Redirecting.');
          router.replace(`/profile/${data.id}`);
          return;
        }

        // Checkout redirect logic
        const cameForCheckout =
          (typeof window !== 'undefined' && localStorage.getItem('checkoutIntent') === '1') ||
          searchParams.get('intent') === 'checkout';

        if (cameForCheckout) {
          const chosen =
            searchParams.get('planId') ||
            (typeof window !== 'undefined' ? localStorage.getItem('preselectedPlanId') : null);

          if (chosen) {
            router.replace(`/billing/checkout?planId=${encodeURIComponent(chosen)}`);
            return;
          }
        }

        // Questionnaire check
        const hasCompleted =
          typeof window !== 'undefined' ? localStorage.getItem('hasCompletedQuestionnaire') : 'true';
        if (!hasCompleted) setShowModal(true);
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, router, routeId]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    router.push('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return authToken ? <CalendarComponent token={authToken} /> : <p>Please log in to see calendar</p>;
      case 'notifications':
        return <NotificationsPanel />;
      case 'messages':
        return <MessagesPanel />;
      case 'WorkoutPlan':
        return <WorkoutPlan />;
      case 'dashboard':
        return user ? (
          <BioCard
            user={{
              id: user.id,
              full_name: user.full_name ?? null,
              email: user.email ?? null,
              profile_image_url: user.profile_image_url ?? null,
              phone_number: user.phone_number ?? user.phone ?? null,
              address: user.address ?? null,
              membership_plan_id: user.membership_plan_id ?? null,
              bio: user.bio ?? null,
            } satisfies BioUser}
            onSaved={(updated) =>
              setUser((u) =>
                u
                  ? {
                      ...u,
                      ...updated,
                      full_name: updated.full_name ?? u.full_name,
                      email: updated.email ?? u.email,
                      id: updated.id ?? u.id,
                      phone_number: updated.phone_number ?? null,
                    }
                  : u
              )
            }
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
          />
        ) : null;
      case 'progress':
        return (
          <WeeklyProgressChart
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
            tz="America/Chicago"
          />
        );
      case 'memberships':
        return user ? (
          <MembershipsPanel
            currentPlanId={user.membership_plan_id ?? null}
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
            onPlanChanged={(planId) =>
              setUser((u) => (u ? { ...u, membership_plan_id: planId ?? null } : u))
            }
          />
        ) : null;
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
    router.push('/login');
    return null;
  }

  return (
    <div className="layout h-100">
      <div className="container-fluid">
        <div className="container-fluid py-3">
          <div className="row">
            <div className="col-lg-4 col-xxl-3 mb-4">
              <Sidebar
                userId={user.id}
                userName={user.full_name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
              />
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
                    onClick={() => setActiveTab('calendar')}
                  >
                    <FaCalendarAlt className="me-2" /> Calendar
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'notifications' ? 'primary' : 'outline-primary'} position-relative`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <IoNotificationsOutline className="me-2" /> Notifications
                    {notificationCount > 0 && (
                      <span className="badge bg-danger ms-2">{notificationCount}</span>
                    )}
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'messages' ? 'primary' : 'outline-primary'}`}
                    onClick={() => setActiveTab('messages')}
                  >
                    <FaComments className="me-2" /> Messages
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'WorkoutPlan' ? 'primary' : 'outline-primary'}`}
                    onClick={() => setActiveTab('WorkoutPlan')}
                  >
                    🏋️ Workout Plan
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

// app/profile/[id]/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import Sidebar from '@/components/profile/sidebar/Sidebar';
import CalendarComponent from '@/components/profile/calendar/Calendar';
import MessagesPanel from '@/components/profile/messages/MessagesPanel';
import NotificationsPanel from '@/components/profile/messages/NotificationsPanel';
import WorkoutPlan from '@/components/profile/charts/WorkoutPlan';
import WeeklyProgressChart from '@/components/profile/charts/WeeklyProgressChart';
import MembershipsPanel from '@/components/profile/memberships/MembershipsPanel';

import BioCard, { type User as BioUser } from '@/components/profile/bio/BioCard';

import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

const WorkoutModal = dynamic<{ onClose: () => void }>(
  () => import('@/components/profile/questionnaire/WorkoutModal'),
  { ssr: false }
);

type SidebarTab =
  | 'calendar'
  | 'notifications'
  | 'messages'
  | 'WorkoutPlan'
  | 'dashboard'
  | 'progress'
  | 'memberships'
  | 'ai'
  | 'settings';

type PageUser = {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  membership_plan_id?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<PageUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [activeTab, setActiveTab] = useState<SidebarTab>('calendar');
  const notificationCount = 3;

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

    (async () => {
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
        setUser(data as PageUser);

        const cameForCheckout =
          (typeof window !== 'undefined' && localStorage.getItem('checkoutIntent') === '1') ||
          searchParams.get('intent') === 'checkout';

        if (cameForCheckout) {
          const chosen =
            searchParams.get('planId') ||
            (typeof window !== 'undefined' ? localStorage.getItem('preselectedPlanId') : null);

          if (chosen) {
            router.replace(`/billing/checkout?planId=${encodeURIComponent(chosen)}`);
            return;
          }
        }

        const hasCompleted =
          typeof window !== 'undefined' ? localStorage.getItem('hasCompletedQuestionnaire') : 'true';
        if (!hasCompleted) setShowModal(true);
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, router]);

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
      case 'WorkoutPlan':
        return <WorkoutPlan />;
      case 'dashboard':
        return user ? (
          <BioCard
            user={{
              id: user.id,
              full_name: user.full_name ?? null,
              email: user.email ?? null,
              profile_image_url: user.profile_image_url ?? null,
              phone_number: user.phone_number ?? user.phone ?? null,
              address: user.address ?? null,
              membership_plan_id: user.membership_plan_id ?? null,
              bio: user.bio ?? null,
            } satisfies BioUser}
            onSaved={(updated) =>
              setUser((u) =>
                u
                  ? {
                      ...u,
                      ...updated,
                      full_name: updated.full_name ?? u.full_name,
                      email: updated.email ?? u.email,
                      id: updated.id ?? u.id,
                      phone_number: updated.phone_number ?? null,
                    }
                  : u
              )
            }
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
          />
        ) : null;
      case 'progress':
        return (
          <WeeklyProgressChart
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
            tz="America/Chicago"
          />
        );
      case 'memberships':
        return user ? (
          <MembershipsPanel
            currentPlanId={user.membership_plan_id ?? null}
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
            onPlanChanged={(planId) =>
              setUser((u) => (u ? { ...u, membership_plan_id: planId ?? null } : u))
            }
          />
        ) : null;
      case 'ai':
      case 'settings':
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
              <Sidebar
                userId={user.id}
                userName={user.full_name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
              />
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
                    onClick={() => setActiveTab('calendar')}
                  >
                    <FaCalendarAlt className="me-2" /> Calendar
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'notifications' ? 'primary' : 'outline-primary'} position-relative`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <IoNotificationsOutline className="me-2" /> Notifications
                    {notificationCount > 0 && (
                      <span className="badge bg-danger ms-2">{notificationCount}</span>
                    )}
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'messages' ? 'primary' : 'outline-primary'}`}
                    onClick={() => setActiveTab('messages')}
                  >
                    <FaComments className="me-2" /> Messages
                  </button>

                  <button
                    className={`btn btn-sm btn-${activeTab === 'WorkoutPlan' ? 'primary' : 'outline-primary'}`}
                    onClick={() => setActiveTab('WorkoutPlan')}
                  >
                    🏋️ Workout Plan
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