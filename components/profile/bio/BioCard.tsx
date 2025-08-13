/* BioCard.tsx */
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export type User = { 
  id: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  phone_number: string | null;
  address: string | null;
  membership_plan_id: string | null;
  bio: string | null;
};

type Props = {
  user: User;
  className?: string;
  onEdit?: () => void;
};

function initialsOf(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1"))
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return phone;
}

export default function BioCard({ user, className, onEdit }: Props) {
  const phonePretty = useMemo(() => formatPhone(user.phone_number), [user.phone_number]);
  const planLabel = useMemo(() => user.membership_plan_id ?? "Free", [user.membership_plan_id]);

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card shadow-sm chart-gradient ${className ?? ""}`}
      style={{ borderRadius: 16 }}
    >
      <div className="card-body">
        <div className="d-flex gap-3 align-items-start">
          <div className="flex-shrink-0">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.full_name ?? "Profile"}
                width={72}
                height={72}
                className="rounded-circle object-fit-cover"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-secondary-subtle text-secondary fw-semibold"
                style={{ width: 72, height: 72 }}
              >
                {initialsOf(user.full_name)}
              </div>
            )}
          </div>

          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h5 className="mb-1">{user.full_name ?? "—"}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted" style={{ fontSize: ".9rem" }}>
                    {user.email ?? "No email"}
                  </span>
                  <span className="badge text-bg-light border">{planLabel}</span>
                </div>
              </div>

              {onEdit && (
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={onEdit}>
                  Edit Profile
                </button>
              )}
            </div>

            {user.bio && (
              <p className="mt-3 mb-2" style={{ whiteSpace: "pre-wrap" }}>
                {user.bio}
              </p>
            )}

            <div className="row mt-2 g-2 small">
              <div className="col-md-4">
                <div className="text-muted">Phone</div>
                <div>{phonePretty ?? "Not set"}</div>
              </div>
              <div className="col-md-4">
                <div className="text-muted">Address</div>
                <div>{user.address ?? "Not set"}</div>
              </div>
              <div className="col-md-4">
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

