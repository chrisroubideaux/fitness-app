// components/admin/trainers/BioAchievements.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaDumbbell, FaStar, FaUserTie, FaMedal } from "react-icons/fa";

type Props = {
  bio: string | null;
  specialties?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
};

const itemStyle = {
  height: "100%",
  padding: "1.4rem",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,250,252,0.96))",
  border: "1px solid rgba(139,92,246,0.10)",
  boxShadow:
    "0 12px 35px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.35)",
};

function StatCard({
  icon,
  title,
  value,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className="col-12 col-sm-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
    >
      <div style={itemStyle}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))",
            color: "#8b5cf6",
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            color: "#94a3b8",
            marginBottom: "0.45rem",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#111827",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {value}
        </div>
      </div>
    </motion.div>
  );
}

export default function BioAchievements({
  bio,
  specialties,
  experience_level,
  experience_years,
  certifications,
}: Props) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!bio) return null;

  return (
    <section
      style={{
        width: "100%",
        padding: isDesktop ? "4.5rem 2rem 6rem 7.25rem" : "4.5rem 1rem 6rem",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #f3f4f6 40%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-50px",
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
          bottom: "-120px",
          left: isDesktop ? "90px" : "-40px",
          width: 250,
          height: 250,
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
        <div
          className="text-center"
          style={{
            maxWidth: 760,
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
            About This Trainer
          </span>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
              marginBottom: "1rem",
            }}
          >
            Philosophy, background, and strengths
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Learn more about this trainer’s coaching style, experience, and the
            areas where they can support your goals most effectively.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-5">
            <div className="row g-4">
              <StatCard
                icon={<FaDumbbell />}
                title="Specialties"
                value={specialties || "Not listed"}
                delay={0.05}
              />
              <StatCard
                icon={<FaStar />}
                title="Level"
                value={experience_level || "Not listed"}
                delay={0.12}
              />
              <StatCard
                icon={<FaUserTie />}
                title="Experience"
                value={
                  experience_years ? `${experience_years}+ years` : "Not listed"
                }
                delay={0.19}
              />
              <StatCard
                icon={<FaMedal />}
                title="Certifications"
                value={certifications || "Not listed"}
                delay={0.26}
              />
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <motion.div
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
              style={{
                ...itemStyle,
                padding: "2rem",
                borderRadius: "30px",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "#8b5cf6",
                  marginBottom: "0.9rem",
                }}
              >
                Trainer Bio
              </div>

              <h3
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                A coach with a personalized approach
              </h3>

              <p
                style={{
                  color: "#475569",
                  fontSize: "1rem",
                  lineHeight: 1.95,
                  marginBottom: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {bio}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


{/*

// components/admin/trainers/BioAchievements.tsx
"use client";

import { motion } from "framer-motion";
import { FaDumbbell, FaStar, FaUserTie, FaMedal } from "react-icons/fa";

type Props = {
  bio: string | null;
  specialties?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
};

const itemStyle = {
  height: "100%",
  padding: "1.4rem",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,250,252,0.96))",
  border: "1px solid rgba(139,92,246,0.10)",
  boxShadow:
    "0 12px 35px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.35)",
};

function StatCard({
  icon,
  title,
  value,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className="col-12 col-sm-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
    >
      <div style={itemStyle}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))",
            color: "#8b5cf6",
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            color: "#94a3b8",
            marginBottom: "0.45rem",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#111827",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {value}
        </div>
      </div>
    </motion.div>
  );
}

export default function BioAchievements({
  bio,
  specialties,
  experience_level,
  experience_years,
  certifications,
}: Props) {
  if (!bio) return null;

  return (
    <section
      style={{
        width: "100%",
        padding: "4.5rem 1rem 6rem",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #f3f4f6 40%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-50px",
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
          bottom: "-120px",
          left: "-40px",
          width: 250,
          height: 250,
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
        <div
          className="text-center"
          style={{
            maxWidth: 760,
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
            About This Trainer
          </span>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
              marginBottom: "1rem",
            }}
          >
            Philosophy, background, and strengths
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Learn more about this trainer’s coaching style, experience, and the
            areas where they can support your goals most effectively.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-5">
            <div className="row g-4">
              <StatCard
                icon={<FaDumbbell />}
                title="Specialties"
                value={specialties || "Not listed"}
                delay={0.05}
              />
              <StatCard
                icon={<FaStar />}
                title="Level"
                value={experience_level || "Not listed"}
                delay={0.12}
              />
              <StatCard
                icon={<FaUserTie />}
                title="Experience"
                value={
                  experience_years ? `${experience_years}+ years` : "Not listed"
                }
                delay={0.19}
              />
              <StatCard
                icon={<FaMedal />}
                title="Certifications"
                value={certifications || "Not listed"}
                delay={0.26}
              />
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <motion.div
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
              style={{
                ...itemStyle,
                padding: "2rem",
                borderRadius: "30px",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "#8b5cf6",
                  marginBottom: "0.9rem",
                }}
              >
                Trainer Bio
              </div>

              <h3
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                A coach with a personalized approach
              </h3>

              <p
                style={{
                  color: "#475569",
                  fontSize: "1rem",
                  lineHeight: 1.95,
                  marginBottom: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {bio}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


*/}

