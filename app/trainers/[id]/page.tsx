// app/trainers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/Nav";

// ✅ Import reusable components
import BioAchievements from "@/components/admin/trainers/BioAchievements";
import ProfileImage from "@/components/admin/trainers/ProfileImage";
import TrainerFooter from "@/components/admin/trainers/TrainerFooter"; 

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

      <section className="py-5 bg-light min-vh-100">
        <div className="container">
          {/* Banner */}
          {admin.profile_banner_url && (
            <div className="mb-5">
              <img
                src={admin.profile_banner_url}
                alt="banner"
                className="w-100 rounded shadow"
                style={{ maxHeight: "320px", objectFit: "cover" }}
              />
            </div>
          )}

          {/* ✅ Profile (image, name, role, contact, socials) */}
          <div className="mb-5">
            <ProfileImage
              url={admin.profile_image_url}
              name={admin.full_name}
              role={admin.role}
              email={admin.email}
              phone_number={admin.phone_number}
              facebook={admin.facebook}
              instagram={admin.instagram}
              youtube={admin.youtube}
              tiktok={admin.tiktok}
            />
          </div>

          {/* ✅ Combined Bio + Achievements */}
          <BioAchievements
            bio={admin.bio}
            specialties={admin.specialties}
            experience_level={admin.experience_level}
            experience_years={admin.experience_years}
            certifications={admin.certifications}
          />
        </div>
      </section>

      {/* ✅ Footer */}
      <TrainerFooter />
    </>
  );
}
