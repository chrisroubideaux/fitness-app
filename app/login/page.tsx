// Login page
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
              objectFit: "cover",   // ✅ Fill container
              objectPosition: "center", // ✅ Keep focus in middle
            }}
            className="w-100 h-100"
            priority
          />
      </div>


      {/* Right: Login Form */}
      <div className="login col-6 d-flex flex-column justify-content-center align-items-center p-5 bg-light">
        <Login />
      </div>


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