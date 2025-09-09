/* login page for admins */

/* login page for admins */

'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';

const AdminLogin: React.FC = () => {
  const [error] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/google/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/facebook/login';
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const adminId = url.searchParams.get('id'); // ✅ safer to pass id from backend as ?id=

    if (token) {
      // ✅ Save token so InboxTab can use it
      localStorage.setItem('adminToken', token);

      // ✅ Redirect appropriately
      if (adminId) {
        window.location.href = `/admin/${adminId}`;
      } else {
        window.location.href = '/admin'; // fallback
      }
    }
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2 className="text-center mb-4">Admin Login</h2>

      <div className="d-flex flex-column gap-3">
        <button
          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Continue with Google (Admin)
        </button>

        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebookSquare /> Continue with Facebook (Admin)
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;



/* login page for admins 

/* login page for admins 

'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';

const AdminLogin: React.FC = () => {
  const [error] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/google/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/facebook/login';
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const adminId = window.location.pathname.split('/admin/')[1]; // ✅ cleaner

    if (token && adminId) {
      localStorage.setItem('adminToken', token);
      window.location.href = `/admin/${adminId}`;
    }
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2 className="text-center mb-4">Admin Login</h2>

      <div className="d-flex flex-column gap-3">
        <button
          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Continue with Google (Admin)
        </button>

        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebookSquare /> Continue with Facebook (Admin)
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;

*/




