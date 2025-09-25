"use client";

import { motion, Variants } from "framer-motion";
import { FaDumbbell, FaStar, FaUserTie, FaMedal } from "react-icons/fa";

type Props = {
  bio: string | null;
  specialties?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function BioAchievements({
  bio,
  specialties,
  experience_level,
  experience_years,
  certifications,
}: Props) {
  const achievements = [
    {
      icon: <FaDumbbell className="service-icon mb-3 text-primary" />,
      label: "Specialties",
      value: specialties || "N/A",
    },
    {
      icon: <FaStar className="service-icon mb-3 text-warning" />,
      label: "Level",
      value: experience_level || "N/A",
    },
    {
      icon: <FaUserTie className="service-icon mb-3 text-success" />,
      label: "Experience",
      value: experience_years ? `${experience_years}+ years` : "N/A",
    },
    {
      icon: <FaMedal className="service-icon mb-3 text-danger" />,
      label: "Certifications",
      value: certifications || "N/A",
    },
  ];

  return (
    <section className="container-fluid py-5">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left: Achievements Grid */}
          <motion.div
            className="col-md-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="row g-3">
              {achievements.map((ach, i) => (
                <motion.div
                  key={i}
                  className="col-6"
                  variants={itemVariants}
                >
                  <div className="service-card text-center p-4 shadow-sm h-100 rounded bg-white">
                    {ach.icon}
                    <h6 className="fw-bold">{ach.label}</h6>
                    <p className="small text-muted">{ach.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Bio / Description */}
          <motion.div
            className="col-md-6 text-center text-md-start"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="fw-bold mb-4">About the Trainer</h2>
            <p className="fs-5 text-dark">
              {bio ||
                "This trainer hasn’t added a description yet. Stay tuned for more details about their journey and expertise."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
