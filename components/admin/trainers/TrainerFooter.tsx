// components/admin/trainers/TrainerFooter.tsx
"use client";

import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="py-4 mt-auto"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)", // subtle gradient
        borderTop: "1px solid #dee2e6",
      }}
    >
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        {/* Copyright */}
        <p className="mb-2 mb-md-0 text-muted small">
          © {new Date().getFullYear()} FitByLena. All rights reserved.
        </p>

        {/* Social Media */}
        <div className="d-flex gap-3">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <FaFacebookF className="social-icon" size={20} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger"
          >
            <FaInstagram className="social-icon" size={20} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger"
          >
            <FaYoutube className="social-icon" size={20} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark"
          >
            <FaTiktok className="social-icon" size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
