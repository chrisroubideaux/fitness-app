// app/layout.tsx

import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/globals.css';
import '@/styles/navbar.css';
import '@/styles/contact.css';
import '@/styles/about.css';
import '@/styles/card.css';
import '@/styles/plans.css';
import '@/styles/calendar.css';
import '@/styles/messages.css';
import '@/styles/charts.css';
import '@/styles/form.css';
import '@/styles/memberships.css';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "fitbylena.com",
  description: "Your go-to platform for fitness and wellness",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}



{/*

  
import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/globals.css';
import '@/styles/navbar.css';
import '@/styles/contact.css';
import '@/styles/about.css';
import '@/styles/card.css';
import '@/styles/plans.css';
import '@/styles/calendar.css';
import '@/styles/messages.css';
import '@/styles/charts.css';
import '@/styles/form.css';
import '@/styles/memberships.css';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Redux setup
import { Provider } from "react-redux";
import type { EnhancedStore } from "@reduxjs/toolkit";
import { store } from "@/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fitbylena.com",
  description: "Your go-to platform for fitness and wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      
        <Provider store={store as EnhancedStore}>
          {children}
          <ToastContainer />
        </Provider>
      </body>
    </html>
  );
}
*/}
