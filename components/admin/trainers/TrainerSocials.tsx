// components/admin/trainers/Banner.tsx
"use client";

import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

type Props = {
  name: string;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function TrainerSocials({
  name,
  facebook,
  instagram,
  youtube,
  tiktok,
}: Props) {
  return (
    <div className="text-center mt-4">
      <h5 className="mb-3">Connect with {name}</h5>
      <div className="d-flex justify-content-center gap-4">
        <a
          href={facebook || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          <FaFacebookF className="social-icon" size={28} />
        </a>
        <a
          href={instagram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-danger"
        >
          <FaInstagram className="social-icon" size={28} />
        </a>
        <a
          href={youtube || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-danger"
        >
          <FaYoutube className="social-icon" size={28} />
        </a>
        <a
          href={tiktok || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dark"
        >
          <FaTiktok className="social-icon" size={28} />
        </a>
      </div>
    </div>
  );
}
