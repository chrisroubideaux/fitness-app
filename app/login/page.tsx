// app/login/page.tsx
'use client';

import Login from '@/components/profile/Login';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'linear-gradient(135deg, #f8fbff 0%, #eef4ff 34%, #ede9fe 70%, #fdfcff 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        className="row g-0"
        style={{
          minHeight: '100vh',
        }}
      >
        <div className="d-none d-lg-block col-lg-6 position-relative">
          <Image
            src="/images/login/login.png"
            alt="Login background"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.38), rgba(139,92,246,0.26))',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 'clamp(2rem, 5vw, 4rem)',
              bottom: 'clamp(2rem, 5vw, 4rem)',
              maxWidth: 520,
              color: '#ffffff',
              zIndex: 2,
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                marginBottom: '1.25rem',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              ← Back Home
            </Link>

            <h1
              style={{
                fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                fontWeight: 950,
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                marginBottom: '1rem',
              }}
            >
              Welcome back to FitByLena.
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: '1.05rem',
                lineHeight: 1.8,
              }}
            >
              Sign in to view your workout plans, progress, memberships, and
              trainer messages.
            </p>
          </div>
        </div>

        <div
          className="col-12 col-lg-6 d-flex align-items-center justify-content-center"
          style={{
            minHeight: '100vh',
            padding: 'clamp(1rem, 4vw, 3rem)',
          }}
        >
          <Login />
        </div>
      </div>
    </main>
  );
}

{/*

"use client";
import Login from "@/components/profile/Login";
import Image from "next/image";


export default function Page() {
  return (
    <div className="layout ">
    <div className=" d-flex vh-100">
      <div className="col-6 position-relative overflow-hidden">
          <Image
            src="/images/login/login.png"
            alt="Login background"
            fill
            style={{
              objectFit: "cover",  
              objectPosition: "center", 
            }}
            className="w-100 h-100"
            priority
          />
      </div>
    
      <div className="login col-6 d-flex flex-column justify-content-center align-items-center p-5 bg-light">
        <Login />
      </div>
    </div>
    </div>
  );
}

*/}