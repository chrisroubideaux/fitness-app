// Admin [id] 
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Admin = {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  address?: string;
  phone?: string;
  profile_image_url?: string;
  membership_plan_id?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) {
      localStorage.setItem('adminToken', tokenFromURL);
    }

    const token = tokenFromURL || localStorage.getItem('adminToken');
    if (!token) {
      setError('No token found.');
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admins/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ Admin fetched:', data);
        setAdmin(data);
      } catch (err) {
        console.error('❌ Failed to fetch admin:', err);
        setError('Failed to load admin profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Loading admin dashboard...</h2>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading admin</h2>
        <p>{error || 'Admin not found.'}</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, Admin {admin.full_name}!</h2>
      <p><strong>Email:</strong> {admin.email}</p>
      {admin.bio && <p><strong>Bio:</strong> {admin.bio}</p>}
      {admin.address && <p><strong>Address:</strong> {admin.address}</p>}
      {admin.phone && <p><strong>Phone:</strong> {admin.phone}</p>}
      {admin.membership_plan_id && (
        <p><strong>Membership Plan:</strong> {admin.membership_plan_id}</p>
      )}
      {admin.profile_image_url && (
        <div>
          <strong>Avatar:</strong><br />
          <img src={admin.profile_image_url} alt="Admin Avatar" width={80} />
        </div>
      )}
      <br />
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Logout
      </button>
    </div>
  );
}
