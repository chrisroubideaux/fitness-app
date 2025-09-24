// app/trainers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/Nav";

// ✅ Import the new reusable components
import BioDescription from "@/components/admin/trainers/BioDescription";
import TrainerAchievements from "@/components/admin/trainers/TrainerAchievements";
import TrainerContact from "@/components/admin/trainers/TrainerContact";
import TrainerSocials from "@/components/admin/trainers/TrainerSocials";

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

      <section className="py-5 layout h-100">
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

          {/* ✅ Bio */}
          <BioDescription bio={admin.bio} />

          {/* ✅ Achievements */}
          <TrainerAchievements
            specialties={admin.specialties}
            experience_level={admin.experience_level}
            experience_years={admin.experience_years}
            certifications={admin.certifications}
          />

          {/* ✅ Contact */}
          <TrainerContact
            email={admin.email}
            phone_number={admin.phone_number}
          />

          {/* ✅ Social Media */}
          <TrainerSocials
            name={admin.full_name}
            facebook={admin.facebook}
            instagram={admin.instagram}
            youtube={admin.youtube}
            tiktok={admin.tiktok}
          />
        </div>
      </section>
    </>
  );
}
