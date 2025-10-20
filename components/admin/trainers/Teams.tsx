// components/admin/trainers/Teams.tsx
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

                    {/* Social icons */}
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



/*
// components/admin/trainers/Teams.tsx
// components/admin/trainers/Teams.tsx
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

  // ✅ Fix: proper Variants typing
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }, // fix ease type
    }),
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <section className="py-5 ">
      <div className="container">
        <h1 className="text-center mb-3 fw-bold fs-2">Meet Our Trainers</h1>
          <p className="text-center mb-5 text-muted ">
          Our expert trainers are here to guide you on your fitness journey.
          <br />
          Explore their profiles and connect with the perfect coach for you!
        </p>
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
                  animate="visible"
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
                        <FaFacebookF className="social-icon" size={18} />
                      </a>
                      <a
                        href={admin.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger"
                      >
                        <FaInstagram className="social-icon" size={18} />
                      </a>
                      <a
                        href={admin.youtube || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger"
                      >
                        <FaYoutube className="social-icon" size={18} />
                      </a>
                      <a
                        href={admin.tiktok || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark"
                      >
                        <FaTiktok className="social-icon" size={18} />
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







*/
