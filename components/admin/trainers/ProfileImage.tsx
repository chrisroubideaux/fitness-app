// components/admin/trainers/ProfileImage.tsx
"use client";

import {
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

type Props = {
  url: string | null;
  name: string;
  role?: string | null;
  email?: string | null;
  phone_number?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

function SocialButton({
  href,
  label,
  children,
}: {
  href?: string | null;
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
        width: 44,
        height: 44,
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
          ? "1px solid rgba(139,92,246,0.16)"
          : "1px solid rgba(148,163,184,0.14)",
        transition: "all 0.25s ease",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {children}
    </a>
  );
}

export default function ProfileImage({
  url,
  name,
  role,
  email,
  phone_number,
  facebook,
  instagram,
  youtube,
  tiktok,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        marginTop: "-88px",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            borderRadius: 30,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94))",
            border: "1px solid rgba(139,92,246,0.10)",
            boxShadow:
              "0 18px 50px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(255,255,255,0.35)",
            padding: "2rem",
          }}
        >
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-4 text-center">
              <img
                src={url || "/images/default-avatar.png"}
                alt={name}
                style={{
                  width: "clamp(140px, 22vw, 210px)",
                  height: "clamp(140px, 22vw, 210px)",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "5px solid #ffffff",
                  boxShadow: "0 16px 38px rgba(15,23,42,0.18)",
                  background: "#fff",
                }}
              />
            </div>

            <div className="col-12 col-lg-8">
              <div className="text-center text-lg-start">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.42rem 0.85rem",
                    borderRadius: 999,
                    background: "rgba(139,92,246,0.10)",
                    color: "#8b5cf6",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Trainer Profile
                </span>

                <h1
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  {name}
                </h1>

                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#6b7280",
                    marginBottom: "1.4rem",
                  }}
                >
                  {role || "Trainer"}
                </p>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        justifyContent: "center",
                        padding: "0.95rem 1rem",
                        borderRadius: 18,
                        background: "rgba(15,23,42,0.04)",
                        border: "1px solid rgba(15,23,42,0.06)",
                      }}
                      className="justify-content-lg-start"
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(139,92,246,0.10)",
                          color: "#8b5cf6",
                          flexShrink: 0,
                        }}
                      >
                        <FaPhone size={16} />
                      </div>

                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 700,
                            color: "#94a3b8",
                            marginBottom: 2,
                          }}
                        >
                          Phone
                        </div>
                        <div
                          style={{
                            color: "#111827",
                            fontWeight: 600,
                            wordBreak: "break-word",
                          }}
                        >
                          {phone_number || "Not available"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        justifyContent: "center",
                        padding: "0.95rem 1rem",
                        borderRadius: 18,
                        background: "rgba(15,23,42,0.04)",
                        border: "1px solid rgba(15,23,42,0.06)",
                      }}
                      className="justify-content-lg-start"
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(236,72,153,0.10)",
                          color: "#ec4899",
                          flexShrink: 0,
                        }}
                      >
                        <FaEnvelope size={16} />
                      </div>

                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 700,
                            color: "#94a3b8",
                            marginBottom: 2,
                          }}
                        >
                          Email
                        </div>
                        <div
                          style={{
                            color: "#111827",
                            fontWeight: 600,
                            wordBreak: "break-word",
                          }}
                        >
                          {email || "Not available"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center justify-content-lg-start flex-wrap"
                  style={{ gap: 10 }}
                >
                  <SocialButton href={facebook} label="Facebook">
                    <FaFacebookF size={16} />
                  </SocialButton>
                  <SocialButton href={instagram} label="Instagram">
                    <FaInstagram size={16} />
                  </SocialButton>
                  <SocialButton href={youtube} label="YouTube">
                    <FaYoutube size={16} />
                  </SocialButton>
                  <SocialButton href={tiktok} label="TikTok">
                    <FaTiktok size={16} />
                  </SocialButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


{/*
"use client";

import {
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

type Props = {
  url: string | null;
  name: string;
  role?: string | null;
  email?: string | null;
  phone_number?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function ProfileImage({
  url,
  name,
  role,
  email,
  phone_number,
  facebook,
  instagram,
  youtube,
  tiktok,
}: Props) {
  return (
    <div className="text-center mb-4">
     
      <img
        src={url || "/images/default-avatar.png"}
        alt={name}
        className="rounded-circle border border-4 shadow"
        style={{
          width: "200px",
          height: "200px",
          objectFit: "cover",
          marginTop: "-80px",
        }}
      />
      <h2 className="mt-3">{name}</h2>
      {role && <p className="text-dark">{role}</p>}

     
      <div className="mt-3">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <FaPhone className="social-icon" size={18} />
          <span>{phone_number || "Not available"}</span>
        </div>
        <div className="d-flex justify-content-center align-items-center gap-2">
          <FaEnvelope className="social-icon" size={18} />
          <span>{email || "Not available"}</span>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-4 mt-4">
        <a
          href={facebook || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={facebook ? "text-primary" : "text-muted"}
        >
          <FaFacebookF className="social-icon" size={18} />
        </a>
        <a
          href={instagram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={instagram ? "text-danger" : "text-muted"}
        >
          <FaInstagram className="social-icon" size={18} />
        </a>
        <a
          href={youtube || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={youtube ? "text-danger" : "text-muted"}
        >
          <FaYoutube className="social-icon" size={18} />
        </a>
        <a
          href={tiktok || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={tiktok ? "text-dark" : "text-muted"}
        >
          <FaTiktok className="social-icon" size={18} />
        </a>
      </div>
    </div>
  );
}

*/}
