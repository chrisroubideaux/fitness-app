// app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';
import { FiCamera, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg')
      );

      const fd = new FormData();
      fd.append('image', blob, 'capture.jpg');

      const res = await fetch('http://localhost:5000/auth/admin/face-login', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Face login failed');
      }

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
    <main
      style={{
        height: '100dvh',
        width: '100%',
        background:
          'linear-gradient(135deg, #f8fbff 0%, #eef4ff 34%, #ede9fe 70%, #fdfcff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 4vw, 3rem)',
        overflow: 'hidden',
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 38,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
          boxShadow:
            '0 24px 70px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(255,255,255,0.45)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(139,92,246,0.10), transparent 30%), radial-gradient(circle at bottom left, rgba(96,165,250,0.10), transparent 28%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: 'clamp(1.25rem, 4vw, 2rem)',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: 900,
              display: 'inline-flex',
              marginBottom: '1rem',
            }}
          >
            ← Back Home
          </Link>

          <div className="text-center mb-4">
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(96,165,250,0.12))',
                color: '#8b5cf6',
                marginBottom: '1rem',
                boxShadow: '0 12px 28px rgba(139,92,246,0.10)',
              }}
            >
              <FiShield size={28} />
            </span>

            <h1
              style={{
                margin: 0,
                color: '#111827',
                fontWeight: 950,
                letterSpacing: '-0.05em',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
              }}
            >
              Admin Login
            </h1>

            <p
              style={{
                margin: '0.75rem auto 0',
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: 380,
              }}
            >
              Secure access for FitByLena admins, trainers, and platform
              management.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  marginBottom: '1rem',
                  padding: '0.9rem 1rem',
                  borderRadius: 18,
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.16)',
                  color: '#b91c1c',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiAlertTriangle />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={adminButtonStyle}
            >
              <span style={iconBubbleStyle}>
                <FaGoogle size={18} color="#EA4335" />
              </span>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              style={adminButtonStyle}
            >
              <span style={iconBubbleStyle}>
                <FaFacebookSquare size={20} color="#1877f2" />
              </span>
              <span>Continue with Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleFaceLogin}
              disabled={loading}
              style={{
                ...adminButtonStyle,
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.12))',
                color: '#7c3aed',
                opacity: loading ? 0.72 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={iconBubbleStyle}>
                <FiCamera size={19} color="#7c3aed" />
              </span>
              <span>{loading ? 'Verifying…' : 'Continue with Face Login'}</span>
            </button>
          </div>

          <p
            style={{
              textAlign: 'center',
              margin: '1.5rem 0 0',
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.82rem',
            }}
          >
            © FitByLena Admin 2026
          </p>
        </div>
      </motion.section>
    </main>
  );
};

const adminButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 18,
  border: '1px solid rgba(139,92,246,0.08)',
  background: 'rgba(255,255,255,0.82)',
  color: '#334155',
  fontWeight: 850,
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  padding: '0.45rem 1rem 0.45rem 0.45rem',
  boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  cursor: 'pointer',
};

const iconBubbleStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 15,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#ffffff',
  border: '1px solid rgba(148,163,184,0.14)',
};

export default AdminLogin;

{/*
'use client';

import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';
import About from '../about/page';

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

*/}
