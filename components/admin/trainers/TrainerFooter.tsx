// components/admin/trainers/TrainerFooter.tsx
"use client";

import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

function FooterIcon({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const active = !!href && href !== "#";

  return (
    <a
      href={active ? href : undefined}
      target={active ? "_blank" : undefined}
      rel={active ? "noopener noreferrer" : undefined}
      aria-label={label}
      onClick={(e) => {
        if (!active) e.preventDefault();
      }}
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        background: active
          ? "rgba(139,92,246,0.10)"
          : "rgba(148,163,184,0.10)",
        color: active ? "#8b5cf6" : "rgba(100,116,139,0.65)",
        border: active
          ? "1px solid rgba(139,92,246,0.14)"
          : "1px solid rgba(148,163,184,0.14)",
      }}
    >
      {children}
    </a>
  );
}

export default function TrainerFooter() {
  return (
    <footer
      style={{
        padding: "2rem 1rem",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        borderTop: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center"
          style={{
            gap: "1rem",
            padding: "1.2rem 1.35rem",
            borderRadius: 24,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(139,92,246,0.08)",
            boxShadow: "0 12px 35px rgba(15,23,42,0.05)",
          }}
        >
          <div className="text-center text-md-start">
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "0.95rem",
              }}
            >
              © {new Date().getFullYear()} FitByLena. All rights reserved.
            </p>
          </div>

          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <FooterIcon href="#" label="Facebook">
              <FaFacebookF size={16} />
            </FooterIcon>
            <FooterIcon href="#" label="Instagram">
              <FaInstagram size={16} />
            </FooterIcon>
            <FooterIcon href="#" label="YouTube">
              <FaYoutube size={16} />
            </FooterIcon>
            <FooterIcon href="#" label="TikTok">
              <FaTiktok size={16} />
            </FooterIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

{/*
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
       
        <p className="mb-2 mb-md-0 text-muted small">
          © {new Date().getFullYear()} FitByLena. All rights reserved.
        </p>

       
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

*/}
