// components/profile/Login.tsx
// components/profile/Login.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCameraRetro } from "react-icons/fa";
import { toast } from 'react-toastify';


const Login = () => {
  const handleGoogleLogin = () => {
    toast.info("Redirecting to Google...");
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  const handleFacebookLogin = () => {
    toast.info("Redirecting to Facebook...");
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg");
      });
      if (!blob) throw new Error("Failed to capture image");

      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      const res = await fetch("http://localhost:5000/api/face/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        toast.success("Face login successful!");
        window.location.href = data.user_id
          ? `/profile/${data.user_id}`
          : "/profile";
      } else {
        toast.error("Face login failed. Please try again.");
        console.error("Face login failed:", data);
      }
    } catch (err) {
      console.error("Error with face login:", err);
      toast.error("Could not access camera");
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const userId = url.searchParams.get("id") || url.searchParams.get("user_id");

    if (token) {
      localStorage.setItem("authToken", token);
      toast.success("Login successful!");
      window.location.href = userId ? `/profile/${userId}` : '/profile';
    }
  }, []);

  return (
    <div className="container d-flex flex-column justify-content-between">
      {/* Header */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="fs-2 fw-bold">Fit By Lena</h1>
        <Link
          href="/"
          className="btn btn-sm btn-outline-secondary rounded-pill mt-2 px-3"
        >
          Back Home
        </Link>
      </motion.div>

      {/* Login Card */}
      <motion.div
        className="p-4 rounded flex-grow-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.h1
          className="fs-2 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Login
        </motion.h1>

        {/* Face Login (standalone) */}
        <div className="text-center mb-3">
          <button
            onClick={handleFaceLogin}
            className="bg-transparent border-0 shadow-none"
            style={{ outline: "none" }}
          >
            <FaCameraRetro size={36} />
          </button>
        </div>

        {/* Styled Divider */}
        <hr style={{ width: "50%", margin: "1rem auto" }} />

        {/* Social Login Buttons */}
        <div className="d-flex flex-column gap-3">
          {/* Google Login */}
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
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              {/* Google SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="18" height="18">
                <path fill="#EA4335" d="M488 261.8c0-17.6-1.6-34.6-4.7-51H249v96.6h135.6c-5.8 31.2-23.2 57.6-49.2 75.2l79.6 61.9C456.3 406.6 488 338.8 488 261.8z"/>
                <path fill="#34A853" d="M249 502c66.9 0 123-22.1 164-60l-79.6-61.9c-22.1 14.8-50.4 23.5-84.4 23.5-64.9 0-119.8-43.8-139.6-102.7l-82 63.3C68.1 447.5 152.9 502 249 502z"/>
                <path fill="#4A90E2" d="M109.4 300.9c-4.6-13.8-7.3-28.5-7.3-43.9 0-15.3 2.7-30.1 7.3-43.9l-82-63.3C9.7 181.1 0 220.3 0 257c0 36.7 9.7 75.9 27.4 108.2l82-63.3z"/>
                <path fill="#FBBC05" d="M249 99.7c36.4 0 69.1 12.6 95 37.2l71.2-71.2C372 23.6 315.9 0 249 0 152.9 0 68.1 54.5 27.4 148.8l82 63.3C129.2 143.5 184.1 99.7 249 99.7z"/>
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Google</span>
          </button>

          {/* Facebook Login */}
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
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              {/* Facebook SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="18" height="18">
                <path fill="#1877f2" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S293.1 0 267.5 0c-73.36 0-121.5 44.38-121.5 124.72V195.3H86.41V288h59.59v224h92.66V288z"/>
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Facebook</span>
          </button>

          {/* X Login */}
          <button
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #000000, #434343)',
              border: 'none',
            }}
          >
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              {/* X SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="18" height="18">
                <path
                  fill="black"
                  d="M714.163 545.826L1160.89 0H1054.9L669.301 464.735L356.674 0H0L464.566 682.736L0 1227H105.99L511.27 730.918L843.326 1227H1200L714.163 545.826ZM561.537 663.661L517.339 600.365L144.257 79.64H297.97L602.474 522.764L646.672 586.059L1029.58 1152.13H875.87L561.537 663.661Z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with X</span>
          </button>

          {/* TikTok Login */}
          <button
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #ff0050, #00f2ea)',
              border: 'none',
            }}
          >
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              {/* TikTok SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18">
                <path
                  fill="#000000"
                  d="M448,209.9v123.4c-45.6,0-89.3-14.2-125-40.5v95.4c0,68.3-55.4,123.7-123.7,123.7S75.6,456.5,75.6,388.2
                  c0-57.8,39.1-106.3,91.9-120.5v126.3c0,17.4,14.2,31.6,31.6,31.6s31.6-14.2,31.6-31.6V0h123.4c0,68.3,55.4,123.7,123.7,123.7z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with TikTok</span>
          </button>
        </div>
      </motion.div>

      {/* Footer */}
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
// components/profile/Login.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCameraRetro } from "react-icons/fa";

const Login = () => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/facebook/login';
  };

  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg");
      });
      if (!blob) throw new Error("Failed to capture image");

      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      const res = await fetch("http://localhost:5000/api/face/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        window.location.href = data.user_id
          ? `/profile/${data.user_id}`
          : "/profile";
      } else {
        setError("Face login failed");
        console.error("Face login failed:", data);
      }
    } catch (err) {
      console.error("Error with face login:", err);
      setError("Could not access camera");
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const userId = url.searchParams.get("id") || url.searchParams.get("user_id");

    if (token) {
      localStorage.setItem("authToken", token);
      window.location.href = userId ? `/profile/${userId}` : '/profile';
    }
  }, []);

  return (
    <div className="container py-5 d-flex flex-column justify-content-between">
     
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="fs-2 fw-bold">Fit By Lena</h1>
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
          className="fs-2 text-center mb-4"
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
            style={{ outline: "none" }}
          >
            <FaCameraRetro size={36} />
          </button>
        </div>

       
        <hr style={{ width: "50%", margin: "1rem auto" }} />

       
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
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
             
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
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="18" height="18">
                <path fill="#1877f2" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S293.1 0 267.5 0c-73.36 0-121.5 44.38-121.5 124.72V195.3H86.41V288h59.59v224h92.66V288z"/>
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with Facebook</span>
          </button>

          
          <button
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #000000, #434343)',
              border: 'none',
            }}
          >
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
             
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="18" height="18">
                <path
                  fill="black"
                  d="M714.163 545.826L1160.89 0H1054.9L669.301 464.735L356.674 0H0L464.566 682.736L0 1227H105.99L511.27 730.918L843.326 1227H1200L714.163 545.826ZM561.537 663.661L517.339 600.365L144.257 79.64H297.97L602.474 522.764L646.672 586.059L1029.58 1152.13H875.87L561.537 663.661Z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with X</span>
          </button>

        
          <button
            className="d-flex align-items-center shadow-sm w-100 text-white fw-semibold"
            style={{
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(90deg, #ff0050, #00f2ea)',
              border: 'none',
            }}
          >
            <div className="d-flex align-items-center justify-content-center me-3 bg-white"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
           
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18">
                <path
                  fill="#000000"
                  d="M448,209.9v123.4c-45.6,0-89.3-14.2-125-40.5v95.4c0,68.3-55.4,123.7-123.7,123.7S75.6,456.5,75.6,388.2
                  c0-57.8,39.1-106.3,91.9-120.5v126.3c0,17.4,14.2,31.6,31.6,31.6s31.6-14.2,31.6-31.6V0h123.4c0,68.3,55.4,123.7,123.7,123.7z"
                />
              </svg>
            </div>
            <span className="flex-grow-1 text-start">Continue with TikTok</span>
          </button>

          {error && <p className="text-danger text-center mt-3">{error}</p>}
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