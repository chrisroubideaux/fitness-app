"use client";

import { FaDumbbell, FaStar, FaUserTie, FaMedal } from "react-icons/fa";

type Props = {
  specialties?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
};

export default function TrainerAchievements({
  specialties,
  experience_level,
  experience_years,
  certifications,
}: Props) {
  return (
    <div className="row text-center g-4 mb-5">
      <div className="col-md-3">
        <FaDumbbell className="social-icon fs-2 mb-2" />
        <h6>Specialties</h6>
        <p>{specialties || "N/A"}</p>
      </div>
      <div className="col-md-3">
        <FaStar className="social-icon fs-2 mb-2" />
        <h6>Level</h6>
        <p>{experience_level || "N/A"}</p>
      </div>
      <div className="col-md-3">
        <FaUserTie className="social-icon fs-2 mb-2" />
        <h6>Experience</h6>
        <p>{experience_years ? `${experience_years}+ years` : "N/A"}</p>
      </div>
      <div className="col-md-3">
        <FaMedal className="social-icon fs-2 mb-2" />
        <h6>Certifications</h6>
        <p>{certifications || "N/A"}</p>
      </div>
    </div>
  );
}
