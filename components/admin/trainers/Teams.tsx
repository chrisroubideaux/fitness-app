// components/admin/trainers/Teams.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

        // filter out your own account
        const filtered = arr.filter(
          (a: Admin) => a.full_name !== "Chris Roubideaux"
        );
        setAdmins(filtered);
      })
      .catch((err) => console.error("Failed to load admins:", err));
  }, []);

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold">Meet Our Trainers</h2>

        <div className="row g-4">
          {admins.map((admin, i) => (
            <div key={admin.admin_id} className="col-md-6 col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className="card h-100 shadow-sm border-0"
              >
                {/* Banner */}
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
                    src={admin.profile_image_url || "/images/default-avatar.png"}
                    alt={admin.full_name}
                    className="rounded-circle border border-3 border-white shadow mb-3"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      marginTop: "-65px",
                    }}
                  />

                  <h5 className="card-title mb-1">{admin.full_name}</h5>
                  <p className="text-muted small mb-2">
                    {admin.role || "Trainer"}
                  </p>

                  <p className="card-text text-truncate" style={{ maxHeight: "3rem" }}>
                    {admin.bio || "No bio available"}
                  </p>

                  {admin.specialties && (
                    <p className="fw-semibold text-primary small mb-1">
                      {admin.specialties}
                    </p>
                  )}
                  {admin.experience_years && (
                    <p className="text-muted small mb-0">
                      {admin.experience_years}+ years experience
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




/*
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

        // filter out your own account
        const filtered = arr.filter(
          (a: Admin) => a.full_name !== "Chris Roubideaux"
        );
        setAdmins(filtered);
      })
      .catch((err) => console.error("Failed to load admins:", err));
  }, []);

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold">Meet Our Trainers</h2>

        <div className="row g-4">
          {admins.map((admin, i) => (
            <div key={admin.admin_id} className="col-md-6 col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className="card h-100 shadow-sm border-0"
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
                    src={admin.profile_image_url || "/images/default-avatar.png"}
                    alt={admin.full_name}
                    className="rounded-circle border border-3 border-white shadow mb-3"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      marginTop: "-65px",
                    }}
                  />

                  <h5 className="card-title mb-1">{admin.full_name}</h5>
                  <p className="text-muted small mb-2">
                    {admin.role || "Trainer"}
                  </p>

                  <p className="card-text text-truncate" style={{ maxHeight: "3rem" }}>
                    {admin.bio || "No bio available"}
                  </p>

                  {admin.specialties && (
                    <p className="fw-semibold text-primary small mb-1">
                      {admin.specialties}
                    </p>
                  )}
                  {admin.experience_years && (
                    <p className="text-muted small mb-0">
                      {admin.experience_years}+ years experience
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

*/
