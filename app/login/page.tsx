// Login page
// app/login/page.tsx
"use client";

import Login from "@/components/profile/Login";


export default function Page() {
  return (
    <div className=" d-flex vh-100">
      {/* Left: Background Video */}
      <div className="col-6 position-relative overflow-hidden">
  <img
    src="/images/login/login.png"
    alt="Login background"
    className="w-100 h-100"
    style={{
      objectFit: "cover",   // ✅ Fill container
      objectPosition: "center", // ✅ Keep focus in middle
    }}
  />
</div>


      {/* Right: Login Form */}
      <div className="col-6 d-flex flex-column justify-content-center align-items-center p-5 bg-light">
        <Login />
      </div>


    </div>
  );
}


/*
'use client';

import Login from '@/components/profile/Login';

export default function Page() {
  return (
    <div className="layout h-100">
      <Login />
    </div>
  );
}
*/