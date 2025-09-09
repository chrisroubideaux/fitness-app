'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';

const Login: React.FC = () => {
  const [error] = useState<string | null>(null);

  // Redirect to Google OAuth
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  // Redirect to Facebook OAuth
  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  useEffect(() => {
    const url = new URL(window.location.href);

    const token = url.searchParams.get('token');
    // ✅ Handle both possible keys from backend (?id=... or ?user_id=...)
    const userId = url.searchParams.get('id') || url.searchParams.get('user_id');

    if (token) {
      // Save token for authenticated requests
      localStorage.setItem('authToken', token);

      // Redirect to profile page with ID if available
      if (userId) {
        window.location.href = `/profile/${userId}`;
      } else {
        window.location.href = '/profile'; // fallback if no ID
      }
    }
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2 className="text-center mb-4">Login</h2>

      <div className="d-flex flex-column gap-3">
        <button
          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Continue with Google
        </button>

        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebookSquare /> Continue with Facebook
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Login;





// Previous version without Next.js navigation
/*

//components/profile/Login.tsx

'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';

const Login: React.FC = () => {
  const [error] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('id'); // ✅ backend should send ?id=<userId>

    if (token) {
      // ✅ Save token for profile pages and messaging
      localStorage.setItem('authToken', token);

      // Redirect to profile page if ID is provided
      if (userId) {
        window.location.href = `/profile/${userId}`;
      } else {
        window.location.href = '/profile'; // fallback
      }
    }
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2 className="text-center mb-4">Login</h2>

      <div className="d-flex flex-column gap-3">
        <button
          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Continue with Google
        </button>

        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebookSquare /> Continue with Facebook
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Login;



*/