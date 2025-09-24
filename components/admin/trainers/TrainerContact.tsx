// components/admin/trainers/Banner.tsx
"use client";

import { FaEnvelope, FaPhone } from "react-icons/fa";

type Props = {
  email?: string | null;
  phone_number?: string | null;
};

export default function TrainerContact({ email, phone_number }: Props) {
  return (
    <div className="row text-center mb-5">
      <div className="col-md-6">
        <FaEnvelope className="social-icon fs-4 me-2" />
        <span>{email || "Not available"}</span>
      </div>
      <div className="col-md-6">
        <FaPhone className="fs-4 social-icon me-2" />
        <span>{phone_number || "Not available"}</span>
      </div>
    </div>
  );
}
