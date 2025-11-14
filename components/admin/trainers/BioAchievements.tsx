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
      className="container-fluid py-5 shadow-lg "
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
        borderRadius: "20px",
      }}
    >
      <div className="container">
        {/* Title */}
        <div className="text-center my-5">
          <h5 className="fs-2 fw-bold">About This Trainer</h5>
          <p className="fs-5 text-muted">
            Learn more about their philosophy, passion, and achievements.
          </p>
        </div>

        <div className="row align-items-center my-5 pt-3">
          {/* ✅ Left: Achievements as cards */}
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="row g-3">
              <motion.div
                className="col-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div
                  className="service-card text-center p-4 shadow-sm h-100 bg-white rounded-3"
                  style={{ borderRadius: "12px" }}
                >
                  <FaDumbbell className="fs-2 mb-2 social-icon" />
                  <h6 className="fw-bold">Specialties</h6>
                  <p className="small">{specialties || "N/A"}</p>
                </div>
              </motion.div>

              <motion.div
                className="col-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="service-card text-center p-4 shadow-sm h-100 bg-white rounded-3"
                  style={{ borderRadius: "12px" }}
                >
                  <FaStar className="fs-2 mb-2 social-icon" />
                  <h6 className="fw-bold">Level</h6>
                  <p className="small">{experience_level || "N/A"}</p>
                </div>
              </motion.div>

              <motion.div
                className="col-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div
                  className="service-card text-center p-4 shadow-sm h-100 bg-white rounded-3"
                  style={{ borderRadius: "12px" }}
                >
                  <FaUserTie className="fs-2 mb-2 social-icon" />
                  <h6 className="fw-bold">Experience</h6>
                  <p className="small">
                    {experience_years ? `${experience_years}+ years` : "N/A"}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="col-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div
                  className="service-card text-center p-4 shadow-sm h-100 bg-white rounded-3"
                  style={{ borderRadius: "12px" }}
                >
                  <FaMedal className="fs-2 mb-2 social-icon" />
                  <h6 className="fw-bold">Certifications</h6>
                  <p className="small">{certifications || "N/A"}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ✅ Right: Bio */}
          <div className="col-md-6 text-center text-md-start">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="p-4 shadow-sm bg-white h-100 rounded-3"
              style={{ borderRadius: "12px" }}
            >
              <h5 className="fw-bold mb-3"> Bio</h5>
              <p className="fs-5 text-dark" style={{ lineHeight: "1.8" }}>
                {bio}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

