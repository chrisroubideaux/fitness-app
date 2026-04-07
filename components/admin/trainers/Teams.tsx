// components/admin/trainers/Teams
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

type Admin = {
  admin_id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
  profile_banner_url: string | null;
  role: string | null;
  specialties: string | null;
  experience_years: number | null;
  experience_level: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

function SocialIcon({
  href,
  label,
  children,
}: {
  href?: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const isActive = !!href && href !== "#";

  return (
    <a
      href={isActive ? href : undefined}
      target={isActive ? "_blank" : undefined}
      rel={isActive ? "noopener noreferrer" : undefined}
      aria-label={label}
      onClick={(e) => {
        if (!isActive) e.preventDefault();
      }}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        background: isActive
          ? "rgba(139,92,246,0.10)"
          : "rgba(148,163,184,0.12)",
        color: isActive ? "#8b5cf6" : "rgba(100,116,139,0.65)",
        border: isActive
          ? "1px solid rgba(139,92,246,0.14)"
          : "1px solid rgba(148,163,184,0.14)",
        transition: "all 0.25s ease",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      {children}
    </a>
  );
}

export default function Teams() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/admins/public")
      .then((res) => res.json())
      .then((data) => {
        const arr: Admin[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { admins?: Admin[] }).admins)
          ? (data as { admins: Admin[] }).admins
          : [];

        const filtered = arr.filter(
          (a: Admin) => a.full_name !== "Chris Roubideaux"
        );

        setAdmins(filtered);
      })
      .catch((err) => console.error("Failed to load admins:", err));
  }, []);

  const hasAdmins = useMemo(() => admins.length > 0, [admins]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.55,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -6,
      transition: { duration: 0.22, ease: "easeOut" },
    },
    tap: { scale: 0.985 },
  };

  return (
    <section
      style={{
        width: "100%",
        padding: isDesktop ? "6rem 2rem 6rem 7.25rem" : "4.5rem 1rem",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 45%, #f3f4f6 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: isDesktop ? "120px" : "-40px",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.08)",
          filter: "blur(45px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-110px",
          right: "-50px",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(236,72,153,0.08)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="text-center"
          style={{
            maxWidth: "760px",
            margin: "0 auto 3.5rem auto",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "0.45rem 0.9rem",
              borderRadius: 999,
              background: "rgba(139,92,246,0.10)",
              color: "#8b5cf6",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Meet Our Trainers
          </span>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
              marginBottom: "1rem",
            }}
          >
            Expert coaching with real support behind every goal
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "1.05rem",
              lineHeight: 1.8,
            }}
          >
            Explore our trainers, learn about their specialties, and connect
            with the coach whose style fits your fitness journey best.
          </p>
        </motion.div>

        {!hasAdmins ? (
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: isDesktop ? "2rem" : "1.5rem",
              borderRadius: 28,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(139,92,246,0.10)",
              boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Trainer profiles will appear here soon.
          </div>
        ) : (
          <div className="row g-4">
            {admins.map((admin, i) => (
              <div key={admin.admin_id} className="col-12 col-md-6 col-xl-4">
                <Link
                  href={`/trainers/${admin.admin_id}`}
                  className="text-decoration-none"
                >
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    whileHover="hover"
                    whileTap="tap"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={i}
                    style={{
                      height: "100%",
                      borderRadius: 28,
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))",
                      border: "1px solid rgba(139,92,246,0.10)",
                      boxShadow:
                        "0 14px 40px rgba(15,23,42,0.08), inset 0 0 0 1px rgba(255,255,255,0.4)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: 180,
                        background: admin.profile_banner_url
                          ? `linear-gradient(rgba(15,23,42,0.12), rgba(15,23,42,0.30)), url(${admin.profile_banner_url}) center/cover no-repeat`
                          : "linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)",
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        padding: "0 1.35rem 1.5rem 1.35rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: -48,
                          marginBottom: "1rem",
                        }}
                      >
                        <img
                          src={
                            admin.profile_image_url ||
                            "/images/default-avatar.png"
                          }
                          alt={admin.full_name}
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "4px solid #ffffff",
                            boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
                            background: "#fff",
                          }}
                        />
                      </div>

                      <div className="text-center">
                        <h3
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 800,
                            color: "#111827",
                            marginBottom: "0.35rem",
                          }}
                        >
                          {admin.full_name}
                        </h3>

                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.38rem 0.8rem",
                            borderRadius: 999,
                            background: "rgba(139,92,246,0.10)",
                            color: "#8b5cf6",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            marginBottom: "0.95rem",
                          }}
                        >
                          {admin.role || "Trainer"}
                        </div>
                      </div>

                      <p
                        style={{
                          color: "#6b7280",
                          lineHeight: 1.7,
                          fontSize: "0.95rem",
                          marginBottom: "1rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "4.9rem",
                          textAlign: "center",
                        }}
                      >
                        {admin.bio || "No bio available yet."}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.55rem",
                          justifyContent: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        {admin.specialties && (
                          <span
                            style={{
                              padding: "0.45rem 0.75rem",
                              borderRadius: 999,
                              background: "rgba(15,23,42,0.05)",
                              color: "#334155",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                            }}
                          >
                            {admin.specialties}
                          </span>
                        )}

                        {admin.experience_years ? (
                          <span
                            style={{
                              padding: "0.45rem 0.75rem",
                              borderRadius: 999,
                              background: "rgba(236,72,153,0.08)",
                              color: "#be185d",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            {admin.experience_years}+ years
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 10,
                          marginBottom: "1rem",
                        }}
                      >
                        <SocialIcon href={admin.facebook} label="Facebook">
                          <FaFacebookF size={15} />
                        </SocialIcon>
                        <SocialIcon href={admin.instagram} label="Instagram">
                          <FaInstagram size={15} />
                        </SocialIcon>
                        <SocialIcon href={admin.youtube} label="YouTube">
                          <FaYoutube size={15} />
                        </SocialIcon>
                        <SocialIcon href={admin.tiktok} label="TikTok">
                          <FaTiktok size={15} />
                        </SocialIcon>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.9rem 1.15rem",
                            borderRadius: 16,
                            background:
                              "linear-gradient(135deg, #8b5cf6, #a855f7)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            boxShadow:
                              "0 12px 26px rgba(139,92,246,0.22)",
                          }}
                        >
                          View Profile
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

{/*
"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

type Admin = {
  admin_id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
  profile_banner_url: string | null;
  role: string | null;
  specialties: string | null;
  experience_years: number | null;
  experience_level: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function Teams() {
  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admins/public")
      .then((res) => res.json())
      .then((data) => {
        const arr: Admin[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { admins?: Admin[] }).admins)
          ? (data as { admins: Admin[] }).admins
          : [];

        const filtered = arr.filter(
          (a: Admin) => a.full_name !== "Chris Roubideaux"
        );
        setAdmins(filtered);
      })
      .catch((err) => console.error("Failed to load admins:", err));
  }, []);

  // 🎬 Animate cards on scroll
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <section className="py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h1 className="text-center mb-3 fw-bold fs-2">Meet Our Trainers</h1>
          <p className="text-center mb-5 text-muted">
            Our expert trainers are here to guide you on your fitness journey.
            <br />
            Explore their profiles and connect with the perfect coach for you!
          </p>
        </motion.div>

        <div className="row g-4">
          {admins.map((admin, i) => (
            <div key={admin.admin_id} className="col-md-6 col-lg-4">
              <Link
                href={`/trainers/${admin.admin_id}`}
                className="text-decoration-none text-dark"
              >
                <motion.div
                  className="card h-100 shadow-sm border-10"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible" // 👈 triggers animation when scrolled into view
                  viewport={{ once: true, amount: 0.2 }} // only triggers once, 20% visible threshold
                  whileHover="hover"
                  whileTap="tap"
                  custom={i}
                >
                  {admin.profile_banner_url && (
                    <img
                      src={admin.profile_banner_url}
                      alt={`${admin.full_name} banner`}
                      className="card-img-top"
                      style={{ height: "160px", objectFit: "cover" }}
                    />
                  )}

                  <div className="card-body text-center">
                    <img
                      src={
                        admin.profile_image_url || "/images/default-avatar.png"
                      }
                      alt={admin.full_name}
                      className="rounded-circle border border-3 border-white shadow mb-3"
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        marginTop: "-65px",
                      }}
                    />

                    <h5 className="mb-1">{admin.full_name}</h5>
                    <p className="text-muted small mb-2">
                      {admin.role || "Trainer"}
                    </p>

                    <p className="text-truncate" style={{ maxHeight: "3rem" }}>
                      {admin.bio || "No bio available"}
                    </p>

                    {admin.specialties && (
                      <p className="fw-semibold paragraph text-dark small mb-1">
                        {admin.specialties}
                      </p>
                    )}
                    {admin.experience_years && (
                      <p className="text-muted small mb-0">
                        {admin.experience_years}+ years experience
                      </p>
                    )}

                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <a
                        href={admin.facebook || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        <FaFacebookF size={18} />
                      </a>
                      <a
                        href={admin.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger"
                      >
                        <FaInstagram size={18} />
                      </a>
                      <a
                        href={admin.youtube || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger"
                      >
                        <FaYoutube size={18} />
                      </a>
                      <a
                        href={admin.tiktok || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark"
                      >
                        <FaTiktok size={18} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/}