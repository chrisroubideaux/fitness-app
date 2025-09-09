// app/admin/[id]/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import AdminSidebar, { type AdminSidebarTab } from '@/components/admin/sidebar/Sidebar';
import AdminCalendar from '@/components/admin/calendar/Calendar';
import AdminMessagesPanel from '@/components/admin/messages/MessagesPanel';
import AdminNotificationsPanel from '@/components/admin/messages/NotificationsPanel';
import PlansPanel from '@/components/admin/plans/PlansPanel';
import UsersPanel from '@/components/admin/users/UsersPanel';
import AdminBioCard, { type Admin as BioAdmin } from '@/components/admin/bio/BioCard';

import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

type Tab = AdminSidebarTab | 'dashboard';

type PageAdmin = {
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

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [admin, setAdmin] = useState<PageAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const notificationCount = 3;

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromURL = url.searchParams.get('token');

    if (tokenFromURL) {
      localStorage.setItem('adminToken', tokenFromURL); // ✅ Always same key
    }

    const token = tokenFromURL || localStorage.getItem('adminToken');
    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/admins/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = (await res.json()) as PageAdmin;
        setAdmin(data);
      } catch (err) {
        console.error('❌ Failed to fetch admin:', err);
        setError('Failed to load admin profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  // ✅ Handle "Message" button from UsersPanel
  const handleMessageUser = async (user: { id: string; full_name: string }) => {
    setActiveTab('messages'); // switch to messages tab

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

    try {
      const res = await fetch(`${apiBase}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`);

      type Conversation = {
        id: string;
        user_id: string;
        // add other relevant properties if needed
      };
      const conversations: Conversation[] = await res.json();
      const convo = conversations.find((c) => c.user_id === user.id);

      if (convo) {
        // ✅ If convo exists, dispatch event to open chat
        window.dispatchEvent(
          new CustomEvent('openAdminChat', { detail: { conversation: convo } })
        );
      } else {
        // ✅ If no convo, dispatch event to start a new one
        window.dispatchEvent(
          new CustomEvent('startAdminNewMessage', {
            detail: { userId: user.id, userName: user.full_name },
          })
        );
      }
    } catch (err) {
      console.error('❌ Failed to check conversations', err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <AdminCalendar />;
      case 'notifications':
        return <AdminNotificationsPanel />;
      case 'messages':
        return <AdminMessagesPanel />;
      case 'plans':
        return <PlansPanel />;
      case 'users':
        return <UsersPanel onMessageUser={handleMessageUser} />; // ✅ Pass prop
      case 'dashboard':
        return admin ? (
          <AdminBioCard
            admin={{
              id: admin.id,
              full_name: admin.full_name ?? null,
              email: admin.email ?? null,
              profile_image_url: admin.profile_image_url ?? null,
              phone_number: admin.phone_number ?? admin.phone ?? null,
              address: admin.address ?? null,
              membership_plan_id: admin.membership_plan_id ?? null,
              bio: admin.bio ?? null,
            } satisfies BioAdmin}
            onSaved={(updated) =>
              setAdmin((a) =>
                a
                  ? {
                      ...a,
                      ...updated,
                      full_name: updated.full_name ?? a.full_name,
                      email: updated.email ?? a.email,
                      id: updated.id ?? a.id,
                      phone_number: updated.phone_number ?? null,
                    }
                  : a
              )
            }
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Loading admin profile...</h2>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading profile</h2>
        <p>{error || 'Admin not found.'}</p>
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
              <AdminSidebar
                adminId={admin.id}
                adminName={admin.full_name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
              />
            </div>
            <div className="col-lg-8 col-xxl-9">
              <div className="mb-4 position-relative">
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  <button
                    className={`btn btn-sm btn-${
                      activeTab === 'calendar' ? 'primary' : 'outline-primary'
                    }`}
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
                    className={`btn btn-sm btn-${
                      activeTab === 'notifications' ? 'primary' : 'outline-primary'
                    } position-relative`}
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
                    className={`btn btn-sm btn-${
                      activeTab === 'messages' ? 'primary' : 'outline-primary'
                    }`}
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




/*

// app/admin/[id]/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import AdminSidebar, { type AdminSidebarTab } from '@/components/admin/sidebar/Sidebar';
import AdminCalendar from '@/components/admin/calendar/Calendar';
import AdminMessagesPanel from '@/components/admin/messages/MessagesPanel';
import AdminNotificationsPanel from '@/components/admin/messages/NotificationsPanel';
import PlansPanel from '@/components/admin/plans/PlansPanel';
import UsersPanel from '@/components/admin/users/UsersPanel';
import AdminBioCard, { type Admin as BioAdmin } from '@/components/admin/bio/BioCard';

import { FaCalendarAlt, FaComments } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

type Tab = AdminSidebarTab | 'dashboard';

type PageAdmin = {
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

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [admin, setAdmin] = useState<PageAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const notificationCount = 3;

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromURL = url.searchParams.get('token');

    if (tokenFromURL) {
      // ✅ Always save under the same key
      localStorage.setItem('adminToken', tokenFromURL);
    }

    const token = tokenFromURL || localStorage.getItem('adminToken');
    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/admins/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = (await res.json()) as PageAdmin;
        setAdmin(data);
      } catch (err) {
        console.error('❌ Failed to fetch admin:', err);
        setError('Failed to load admin profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // ✅ same key
    router.push('/admin');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <AdminCalendar />;
      case 'notifications':
        return <AdminNotificationsPanel />;
      case 'messages':
        return <AdminMessagesPanel />;
      case 'plans':
        return <PlansPanel />;
      case 'users':
        return <UsersPanel />;
      case 'dashboard':
        return admin ? (
          <AdminBioCard
            admin={{
              id: admin.id,
              full_name: admin.full_name ?? null,
              email: admin.email ?? null,
              profile_image_url: admin.profile_image_url ?? null,
              phone_number: admin.phone_number ?? admin.phone ?? null,
              address: admin.address ?? null,
              membership_plan_id: admin.membership_plan_id ?? null,
              bio: admin.bio ?? null,
            } satisfies BioAdmin}
            onSaved={(updated) =>
              setAdmin((a) =>
                a
                  ? {
                      ...a,
                      ...updated,
                      full_name: updated.full_name ?? a.full_name,
                      email: updated.email ?? a.email,
                      id: updated.id ?? a.id,
                      phone_number: updated.phone_number ?? null,
                    }
                  : a
              )
            }
            apiBase={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Loading admin profile...</h2>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading profile</h2>
        <p>{error || 'Admin not found.'}</p>
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
              <AdminSidebar
                adminId={admin.id}
                adminName={admin.full_name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
              />
            </div>
            <div className="col-lg-8 col-xxl-9">
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