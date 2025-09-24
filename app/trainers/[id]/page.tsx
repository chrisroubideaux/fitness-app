// app/trainers/[id]/page.tsx
// app/trainers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/navbar/Nav"; // ✅ import your Nav component
import {
  FaDumbbell,
  FaStar,
  FaUserTie,
  FaMedal,
  FaEnvelope,
  FaPhone,
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
  certifications: string | null;
  email: string | null;
  phone_number: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function TrainerDetailPage() {
  const { id } = useParams();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/admins/public/${id}`)
      .then((res) => res.json())
      .then((data) => setAdmin(data))
      .catch((err) => console.error("Failed to load admin:", err));
  }, [id]);

  if (!admin) {
    return (
      <div className="container py-5 text-center">
        <h2>Loading trainer details...</h2>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Global Navbar */}
      <Nav />

      <section className="py-5 bg-light">
        <div className="container">
          {/* Banner */}
          {admin.profile_banner_url && (
            <img
              src={admin.profile_banner_url}
              alt="banner"
              className="w-100 mb-4 rounded shadow"
              style={{ maxHeight: "320px", objectFit: "cover" }}
            />
          )}

          {/* ✅ Back link */}
          <div className="mb-3">
            <Link href="/" className="btn btn-outline-secondary btn-sm">
              ← Back to Home
            </Link>
          </div>

          {/* Profile */}
          <div className="text-center mb-5">
            <img
              src={admin.profile_image_url || "/images/default-avatar.png"}
              alt={admin.full_name}
              className="rounded-circle border border-4 shadow"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                marginTop: "-70px",
              }}
            />
            <h2 className="mt-3">{admin.full_name}</h2>
            <p className="text-muted">{admin.role || "Trainer"}</p>
          </div>

          {/* Bio */}
          {admin.bio && (
            <div className="mb-4 text-center">
              <p className="fs-5">{admin.bio}</p>
            </div>
          )}

          {/* Achievements */}
          <div className="row text-center g-4 mb-5">
            <div className="col-md-3">
              <FaDumbbell className="social-icon fs-2 mb-2" />
              <h6>Specialties</h6>
              <p>{admin.specialties || "N/A"}</p>
            </div>
            <div className="col-md-3">
              <FaStar className="social-icon fs-2 mb-2" />
              <h6>Level</h6>
              <p>{admin.experience_level || "N/A"}</p>
            </div>
            <div className="col-md-3">
              <FaUserTie className="social-icon fs-2 mb-2" />
              <h6>Experience</h6>
              <p>
                {admin.experience_years
                  ? `${admin.experience_years}+ years`
                  : "N/A"}
              </p>
            </div>
            <div className="col-md-3">
              <FaMedal className="social-icon fs-2 mb-2" />
              <h6>Certifications</h6>
              <p>{admin.certifications || "N/A"}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="row text-center mb-5">
            <div className="col-md-6">
              <FaEnvelope className=" social-icon fs-4  me-2" />
              <span>{admin.email || "Not available"}</span>
            </div>
            <div className="col-md-6">
              <FaPhone className="fs-4 social-icon me-2" />
              <span>{admin.phone_number || "Not available"}</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center mt-4">
            <h5 className="mb-3">Connect with {admin.full_name}</h5>
            <div className="d-flex justify-content-center gap-4">
              <a
                href={admin.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                <FaFacebookF className="social-icon" size={28} />
              </a>
              <a
                href={admin.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-danger"
              >
                <FaInstagram className="social-icon" size={28} />
              </a>
              <a
                href={admin.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-danger"
              >
                <FaYoutube className="social-icon" size={28} />
              </a>
              <a
                href={admin.tiktok || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
              >
                <FaTiktok className="social-icon" size={28} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
