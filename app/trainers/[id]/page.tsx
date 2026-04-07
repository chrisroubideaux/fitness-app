// app/trainers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/Nav";
import BioAchievements from "@/components/admin/trainers/BioAchievements";
import ProfileImage from "@/components/admin/trainers/ProfileImage";
import ProfileBanner from "@/components/admin/trainers/ProfileBanner";
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
      <>
        <Nav />
        <main
          style={{
            width: "100%",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
            background:
              "linear-gradient(180deg, #0f172a 0%, #111827 50%, #1f2937 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              padding: "2rem 1rem",
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                marginBottom: "0.75rem",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Loading trainer details...
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              Pulling profile information now.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />

      <main
        style={{
          width: "100%",
          margin: 0,
          padding: 0,
          background: "#ffffff",
          overflowX: "hidden",
        }}
      >
        <ProfileBanner
          name={admin.full_name}
          bannerUrl={admin.profile_banner_url}
        />

        <div
          style={{
            position: "relative",
            zIndex: 3,
            marginTop: "-96px",
            padding: "0 1rem",
          }}
        >
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

        <BioAchievements
          bio={admin.bio}
          specialties={admin.specialties}
          experience_level={admin.experience_level}
          experience_years={admin.experience_years}
          certifications={admin.certifications}
        />
      </main>

      <TrainerFooter />
    </>
  );
}


{/*
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
     
      <Nav />

      <section className="py-5 bg-light min-vh-100">
        <div className="container">
         
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

         
          <BioAchievements
            bio={admin.bio}
            specialties={admin.specialties}
            experience_level={admin.experience_level}
            experience_years={admin.experience_years}
            certifications={admin.certifications}
          />
        </div>
      </section>

     
      <TrainerFooter />
    </>
  );
}

*/}
