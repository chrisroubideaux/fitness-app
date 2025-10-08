/* login page for admins */
'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';

const AdminLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/google/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/admin/facebook/login';
  };

  const handleFaceLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Open webcam capture
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Grab one frame as image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop the webcam
      stream.getTracks().forEach((track) => track.stop());

      // Convert to blob
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg')
      );

      const fd = new FormData();
      fd.append('image', blob, 'capture.jpg');

      // Call backend face login API for admins
      const res = await fetch('http://localhost:5000/auth/admin/face-login', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Face login failed');
      }

      // Save token + redirect
      localStorage.setItem('adminToken', data.token);
      if (data.admin_id) {
        window.location.href = `/admin/${data.admin_id}`;
      } else {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const adminId = url.searchParams.get('id');

    if (token) {
      localStorage.setItem('adminToken', token);
      if (adminId) {
        window.location.href = `/admin/${adminId}`;
      } else {
        window.location.href = '/admin';
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

        <button
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFaceLogin}
          disabled={loading}
        >
          <FiCamera /> {loading ? 'Verifying…' : 'Continue with Face Login (Admin)'}
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;



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
    const adminId = url.searchParams.get('id'); // ✅ safer to pass id from backend as ?id=

    if (token) {
      // ✅ Save token so InboxTab can use it
      localStorage.setItem('adminToken', token);

     
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



*/




