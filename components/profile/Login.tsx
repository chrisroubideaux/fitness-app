// 
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

  // Optional: Handle token in URL on mount (for redirect-based flow)
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userId = url.pathname.split('/').pop(); // Assumes /profile/:id route

    if (token) {
      localStorage.setItem('authToken', token);
      if (userId) {
        window.location.href = `/profile/${userId}`;
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
