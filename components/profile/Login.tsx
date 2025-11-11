// components/profile/Login.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCameraRetro, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { setToken, fetchUserProfile } from '@/store/slices/userSlice';

const Login = () => {
  const dispatch = useAppDispatch();

  // ---------------------------
  // 🧠 Handlers
  // ---------------------------

  const handleGoogleLogin = () => {
    toast.info('Redirecting to Google...');
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  const handleFacebookLogin = () => {
    toast.info('Redirecting to Facebook...');
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  const handleXLogin = () => {
    toast.info('Redirecting to X (Twitter)...');
    // Future route for OAuth
    window.location.href = 'http://localhost:5000/auth/x/login';
  };

  const handleTikTokLogin = () => {
    toast.info('Redirecting to TikTok...');
    // Future route for OAuth
    window.location.href = 'http://localhost:5000/auth/tiktok/login';
  };

  // ✅ Face Login → dispatch Redux on success
  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg');
      });
      if (!blob) throw new Error('Failed to capture image');

      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');

      const res = await fetch('http://localhost:5000/api/face/login', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.token) {
        dispatch(setToken(data.token));
        dispatch(fetchUserProfile());
        toast.success('Face login successful!');

        const redirectUrl = data.user_id ? `/profile/${data.user_id}` : '/profile';
        window.location.href = redirectUrl;
      } else {
        toast.error('Face login failed. Please try again.');
        console.error('Face login failed:', data);
      }
    } catch (err) {
      console.error('Error with face login:', err);
      toast.error('Could not access camera');
    }
  };

  // ---------------------------
  // 🧩 Handle OAuth Redirects
  // ---------------------------
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('id') || url.searchParams.get('user_id');

    if (token) {
      dispatch(setToken(token));
      dispatch(fetchUserProfile());
      toast.success('Login successful!');

      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);

      if (userId) {
        window.location.href = `/profile/${userId}`;
      } else {
        window.location.href = '/profile';
      }
    }
  }, [dispatch]);

  // ---------------------------
  // 🧱 UI
  // ---------------------------
  return (
    <div className="container d-flex flex-column justify-content-between">
    
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href="/"
          className="btn btn-sm btn-outline-secondary rounded-pill mt-2 px-3"
        >
          Back Home
        </Link>
      </motion.div>

     
      <motion.div
        className="p-4 rounded flex-grow-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.h1
          className="fs-2 fw-bold text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Login
        </motion.h1>

      
        <div className="text-center mb-3">
          <button
            onClick={handleFaceLogin}
            className="bg-transparent border-0 shadow-none"
            style={{ outline: 'none' }}
            title="Login with Face Recognition"
          >
            <FaCameraRetro className="bio-icon" size={36} />
          </button>
        </div>

        <hr style={{ width: '50%', margin: '1rem auto' }} />

     
        <div className="d-flex flex-column gap-3">
        
          <button
            onClick={handleGoogleLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="18" height="18">
                <path fill="#EA4335" d="M488 261.8c0-17.6-1.6-34.6-4.7-51H249v96.6h135.6c-5.8 31.2-23.2 57.6-49.2 75.2l79.6 61.9C456.3 406.6 488 338.8 488 261.8z"/>
                <path fill="#34A853" d="M249 502c66.9 0 123-22.1 164-60l-79.6-61.9c-22.1 14.8-50.4 23.5-84.4 23.5-64.9 0-119.8-43.8-139.6-102.7l-82 63.3C68.1 447.5 152.9 502 249 502z"/>
                <path fill="#4A90E2" d="M109.4 300.9c-4.6-13.8-7.3-28.5-7.3-43.9 0-15.3 2.7-30.1 7.3-43.9l-82-63.3C9.7 181.1 0 220.3 0 257c0 36.7 9.7 75.9 27.4 108.2l82-63.3z"/>
                <path fill="#FBBC05" d="M249 99.7c36.4 0 69.1 12.6 95 37.2l71.2-71.2C372 23.6 315.9 0 249 0 152.9 0 68.1 54.5 27.4 148.8l82 63.3C129.2 143.5 184.1 99.7 249 99.7z"/>
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Google</span>
          </button>

        
          <button
            onClick={handleFacebookLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #1877f2, #00c6ff)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="18" height="18">
                <path
                  fill="#1877f2"
                  d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S293.1 0 267.5 0c-73.36 0-121.5 44.38-121.5 124.72V195.3H86.41V288h59.59v224h92.66V288z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Facebook</span>
          </button>

        
          <button
            onClick={handleXLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #000000, #434343)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <FaXTwitter size={18} color="#000" />
            </div>
            <span className="flex-grow-1 text-start">Continue with X</span>
          </button>

        
          <button
            onClick={handleTikTokLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #ff0050, #00f2ea)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <FaTiktok size={18} color="#000" />
            </div>
            <span className="flex-grow-1 text-start">Continue with TikTok</span>
          </button>
        </div>
      </motion.div>

      <motion.p
        className="text-center text-muted small mt-4 mb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        © FitByLena 2025
      </motion.p>
    </div>
  );
};

export default Login;



// Previous version without Next.js navigation
/*
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCameraRetro, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { setToken, fetchUserProfile } from '@/store/slices/userSlice';

const Login = () => {
  const dispatch = useAppDispatch();

  // ---------------------------
  // 🧠 Handlers
  // ---------------------------

  const handleGoogleLogin = () => {
    toast.info('Redirecting to Google...');
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  const handleFacebookLogin = () => {
    toast.info('Redirecting to Facebook...');
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  const handleXLogin = () => {
    toast.info('Redirecting to X (Twitter)...');
    // Future route for OAuth
    window.location.href = 'http://localhost:5000/auth/x/login';
  };

  const handleTikTokLogin = () => {
    toast.info('Redirecting to TikTok...');
    // Future route for OAuth
    window.location.href = 'http://localhost:5000/auth/tiktok/login';
  };

  // ✅ Face Login → dispatch Redux on success
  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg');
      });
      if (!blob) throw new Error('Failed to capture image');

      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');

      const res = await fetch('http://localhost:5000/api/face/login', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.token) {
        dispatch(setToken(data.token));
        dispatch(fetchUserProfile());
        toast.success('Face login successful!');

        const redirectUrl = data.user_id ? `/profile/${data.user_id}` : '/profile';
        window.location.href = redirectUrl;
      } else {
        toast.error('Face login failed. Please try again.');
        console.error('Face login failed:', data);
      }
    } catch (err) {
      console.error('Error with face login:', err);
      toast.error('Could not access camera');
    }
  };

  // ---------------------------
  // 🧩 Handle OAuth Redirects
  // ---------------------------
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('id') || url.searchParams.get('user_id');

    if (token) {
      dispatch(setToken(token));
      dispatch(fetchUserProfile());
      toast.success('Login successful!');

      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);

      if (userId) {
        window.location.href = `/profile/${userId}`;
      } else {
        window.location.href = '/profile';
      }
    }
  }, [dispatch]);

  // ---------------------------
  // 🧱 UI
  // ---------------------------
  return (
    <div className="container d-flex flex-column justify-content-between">
    
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href="/"
          className="btn btn-sm btn-outline-secondary rounded-pill mt-2 px-3"
        >
          Back Home
        </Link>
      </motion.div>

     
      <motion.div
        className="p-4 rounded flex-grow-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.h1
          className="fs-2 fw-bold text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Login
        </motion.h1>

      
        <div className="text-center mb-3">
          <button
            onClick={handleFaceLogin}
            className="bg-transparent border-0 shadow-none"
            style={{ outline: 'none' }}
            title="Login with Face Recognition"
          >
            <FaCameraRetro className="bio-icon" size={36} />
          </button>
        </div>

        <hr style={{ width: '50%', margin: '1rem auto' }} />

     
        <div className="d-flex flex-column gap-3">
        
          <button
            onClick={handleGoogleLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="18" height="18">
                <path fill="#EA4335" d="M488 261.8c0-17.6-1.6-34.6-4.7-51H249v96.6h135.6c-5.8 31.2-23.2 57.6-49.2 75.2l79.6 61.9C456.3 406.6 488 338.8 488 261.8z"/>
                <path fill="#34A853" d="M249 502c66.9 0 123-22.1 164-60l-79.6-61.9c-22.1 14.8-50.4 23.5-84.4 23.5-64.9 0-119.8-43.8-139.6-102.7l-82 63.3C68.1 447.5 152.9 502 249 502z"/>
                <path fill="#4A90E2" d="M109.4 300.9c-4.6-13.8-7.3-28.5-7.3-43.9 0-15.3 2.7-30.1 7.3-43.9l-82-63.3C9.7 181.1 0 220.3 0 257c0 36.7 9.7 75.9 27.4 108.2l82-63.3z"/>
                <path fill="#FBBC05" d="M249 99.7c36.4 0 69.1 12.6 95 37.2l71.2-71.2C372 23.6 315.9 0 249 0 152.9 0 68.1 54.5 27.4 148.8l82 63.3C129.2 143.5 184.1 99.7 249 99.7z"/>
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Google</span>
          </button>

        
          <button
            onClick={handleFacebookLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #1877f2, #00c6ff)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="18" height="18">
                <path
                  fill="#1877f2"
                  d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S293.1 0 267.5 0c-73.36 0-121.5 44.38-121.5 124.72V195.3H86.41V288h59.59v224h92.66V288z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Facebook</span>
          </button>

        
          <button
            onClick={handleXLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #000000, #434343)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <FaXTwitter size={18} color="#000" />
            </div>
            <span className="flex-grow-1 text-start">Continue with X</span>
          </button>

        
          <button
            onClick={handleTikTokLogin}
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #ff0050, #00f2ea)',
              border: 'none',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <FaTiktok size={18} color="#000" />
            </div>
            <span className="flex-grow-1 text-start">Continue with TikTok</span>
          </button>
        </div>
      </motion.div>

      <motion.p
        className="text-center text-muted small mt-4 mb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        © FitByLena 2025
      </motion.p>
    </div>
  );
};

export default Login;




*/