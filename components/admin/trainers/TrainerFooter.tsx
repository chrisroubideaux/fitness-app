// components/admin/trainers/TrainerFooter.tsx
"use client";

import { useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

type FooterIconProps = {
  href?: string;
  label: string;
  children: React.ReactNode;
  hoverBackground: string;
  hoverColor: string;
  hoverBorder: string;
};

function FooterIcon({
  href,
  label,
  children,
  hoverBackground,
  hoverColor,
  hoverBorder,
}: FooterIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hasRealLink = !!href && href !== "#";

  return (
    <a
      href={href || "#"}
      target={hasRealLink ? "_blank" : undefined}
      rel={hasRealLink ? "noopener noreferrer" : undefined}
      aria-label={label}
      onClick={(e) => {
        if (!hasRealLink) e.preventDefault();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        background: isHovered
          ? hoverBackground
          : "rgba(139,92,246,0.10)",
        color: isHovered ? hoverColor : "#8b5cf6",
        border: isHovered
          ? hoverBorder
          : "1px solid rgba(139,92,246,0.14)",
        transform: isHovered
          ? "translateY(-3px) scale(1.04)"
          : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? "0 12px 24px rgba(15,23,42,0.10)"
          : "none",
        transition:
          "background 0.22s ease, color 0.22s ease, border 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease",
        cursor: "pointer",
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
            <FooterIcon
              href="#"
              label="Facebook"
              hoverBackground="rgba(59,130,246,0.12)"
              hoverColor="#3b82f6"
              hoverBorder="1px solid rgba(59,130,246,0.20)"
            >
              <FaFacebookF size={16} />
            </FooterIcon>

            <FooterIcon
              href="#"
              label="Instagram"
              hoverBackground="linear-gradient(135deg, rgba(236,72,153,0.14), rgba(168,85,247,0.14))"
              hoverColor="#db2777"
              hoverBorder="1px solid rgba(236,72,153,0.18)"
            >
              <FaInstagram size={16} />
            </FooterIcon>

            <FooterIcon
              href="#"
              label="YouTube"
              hoverBackground="rgba(239,68,68,0.12)"
              hoverColor="#ef4444"
              hoverBorder="1px solid rgba(239,68,68,0.20)"
            >
              <FaYoutube size={16} />
            </FooterIcon>

            <FooterIcon
              href="#"
              label="TikTok"
              hoverBackground="linear-gradient(135deg, rgba(24,24,27,0.10), rgba(34,211,238,0.12))"
              hoverColor="#18181b"
              hoverBorder="1px solid rgba(34,211,238,0.18)"
            >
              <FaTiktok size={16} />
            </FooterIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}



{/*

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




*/}
