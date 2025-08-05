// Profile Page/User[id]/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/profile/sidebar/Sidebar';
import CalendarComponent from '@/components/profile/calendar/Calendar';

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
  const [activeTab, setActiveTab] = useState<'calendar' | 'progress' | 'messages'>('calendar');

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
      case 'progress':
        return <div>📈 Progress tracking coming soon!</div>;
      case 'messages':
        return <div>💬 Messaging feature coming soon!</div>;
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
  <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
    <Sidebar userId={user.id} userName={user.full_name} onLogout={handleLogout} />

    <div
      className="flex-grow-1 p-4"
      style={{
        overflowY: 'auto',
        maxWidth: '100%',
        paddingLeft: '2rem',
        paddingRight: '2rem',
      }}
    >
      {showModal && (
        <WorkoutModal
          onClose={() => {
            localStorage.setItem('hasCompletedQuestionnaire', 'true');
            setShowModal(false);
          }}
        />
      )}

      {/* Tab Navigation */}
      <div className="mb-4 d-flex flex-wrap gap-3">
        <button
          className={`btn btn-${activeTab === 'calendar' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`btn btn-${activeTab === 'progress' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
        <button
          className={`btn btn-${activeTab === 'messages' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-wrapper">{renderTabContent()}</div>
    </div>
  </div>
);
}




/*

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/profile/sidebar/Sidebar'; // ✅ Sidebar import

// Dynamic import to prevent SSR issues
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ User fetched:', data);
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
    <div className="d-flex" style={{ minHeight: '100vh' }}>
    
    <Sidebar userId={user.id} userName={user.full_name}  onLogout={handleLogout}  />

     
      <div className="flex-grow-1 p-4" style={{ overflowX: 'hidden' }}>
        {showModal && (
  <WorkoutModal
    onClose={() => {
      localStorage.setItem('hasCompletedQuestionnaire', 'true'); // ✅ Set flag on close
      setShowModal(false); // ✅ Hide modal
    }}
  />
)}


        
      </div>
    </div>
  );
}






*/