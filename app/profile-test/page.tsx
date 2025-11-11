// app/profile-test/page.tsx (or your test route)
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, setToken } from '@/store/slices/userSlice';

export default function ProfileTestPage() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, token } = useAppSelector((state) => state.user);
  const [hydrated, setHydrated] = useState(false);

  // Step 1 — Restore token from localStorage on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = localStorage.getItem('token');
    if (savedToken && !token) {
      dispatch(setToken(savedToken));
    }
    setHydrated(true);
  }, [dispatch, token]);

  // Step 2 — Fetch user profile once token exists
  useEffect(() => {
    if (hydrated && token && !profile && !loading && !error) {
      console.log("📡 Fetching user profile...");
      dispatch(fetchUserProfile());
    }
  }, [dispatch, hydrated, token, profile, loading, error]);

  if (!hydrated) {
    return <div className="p-4 text-center">Loading client state...</div>;
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">🧠 Redux User Profile Test</h2>

      {!token && (
        <div className="alert alert-warning">
          No token found. Please log in first.
        </div>
      )}

      {loading && <p>Loading profile...</p>}

      {error && !loading && (
        <div className="alert alert-danger">{error}</div>
      )}

      {profile && (
        <div className="card p-4 shadow-sm mt-3">
          <h4>{profile.full_name}</h4>
          <p>Email: {profile.email}</p>
          <p>Plan: {profile.plan_name || 'Free'}</p>
          <p>Price: ${profile.plan_price ?? 0}</p>
          {profile.profile_image_url && (
            <img
              src={profile.profile_image_url}
              alt="Profile"
              className="rounded-circle mt-3"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                border: '2px solid #ccc',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}



{/*

'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, setToken } from '@/store/slices/userSlice';

export default function ProfileTestPage() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, token } = useAppSelector((state) => state.user);
  const [hydrated, setHydrated] = useState(false);

  // Step 1 — Restore token from localStorage on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = localStorage.getItem('token');
    if (savedToken && !token) {
      dispatch(setToken(savedToken));
    }
    setHydrated(true);
  }, [dispatch, token]);

  // Step 2 — Fetch user profile once token exists
  useEffect(() => {
    if (hydrated && token && !profile && !loading && !error) {
      console.log("📡 Fetching user profile...");
      dispatch(fetchUserProfile());
    }
  }, [dispatch, hydrated, token, profile, loading, error]);

  if (!hydrated) {
    return <div className="p-4 text-center">Loading client state...</div>;
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">🧠 Redux User Profile Test</h2>

      {!token && (
        <div className="alert alert-warning">
          No token found. Please log in first.
        </div>
      )}

      {loading && <p>Loading profile...</p>}

      {error && !loading && (
        <div className="alert alert-danger">{error}</div>
      )}

      {profile && (
        <div className="card p-4 shadow-sm mt-3">
          <h4>{profile.full_name}</h4>
          <p>Email: {profile.email}</p>
          <p>Plan: {profile.plan_name || 'Free'}</p>
          <p>Price: ${profile.plan_price ?? 0}</p>
          {profile.profile_image_url && (
            <img
              src={profile.profile_image_url}
              alt="Profile"
              className="rounded-circle mt-3"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                border: '2px solid #ccc',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}




*/}