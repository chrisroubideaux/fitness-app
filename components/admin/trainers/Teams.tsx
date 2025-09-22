// components/admin/trainers/Teams.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Admin = {
  admin_id: string;
  full_name: string;
  bio: string | null;
  certifications: string | null;
  email: string;
  phone_number: string | null;
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
    fetch("http://localhost:5000/api/admins")
      .then((res) => res.json())
      .then((data) => {
        // Filter out your own account
        const filtered = data.filter(
          (a: Admin) => a.full_name !== "Chris Roubideaux"
        );
        setAdmins(filtered);
      })
      .catch((err) => console.error("Failed to load admins:", err));
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Meet Our Trainers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin, i) => (
            <motion.div
              key={admin.admin_id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Banner */}
              {admin.profile_banner_url && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={admin.profile_banner_url}
                    alt={`${admin.full_name} banner`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Profile */}
              <div className="p-6 text-center">
                <div className="flex justify-center -mt-16">
                  <img
                    src={admin.profile_image_url || "/images/default-avatar.png"}
                    alt={admin.full_name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                  />
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {admin.full_name}
                </h3>
                <p className="text-sm text-gray-500">{admin.role}</p>

                <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                  {admin.bio || "No bio available"}
                </p>

                <div className="mt-4">
                  {admin.specialties && (
                    <p className="text-xs font-medium text-blue-600">
                      {admin.specialties}
                    </p>
                  )}
                  {admin.experience_years && (
                    <p className="text-xs text-gray-500">
                      {admin.experience_years}+ years experience
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-center gap-4">
                  <a
                    href={`mailto:${admin.email}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Contact
                  </a>
                  {admin.phone_number && (
                    <a
                      href={`tel:${admin.phone_number}`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
