// components/admin/trainers/ProfileImage.tsx
// components/admin/trainers/ProfileImage.tsx
"use client";

import {
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

type Props = {
  url: string | null;
  name: string;
  role?: string | null;
  email?: string | null;
  phone_number?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function ProfileImage({
  url,
  name,
  role,
  email,
  phone_number,
  facebook,
  instagram,
  youtube,
  tiktok,
}: Props) {
  return (
    <div className="text-center mb-4">
      {/* Profile image */}
      <img
        src={url || "/images/default-avatar.png"}
        alt={name}
        className="rounded-circle border border-4 shadow"
        style={{
          width: "200px",
          height: "200px",
          objectFit: "cover",
          marginTop: "-80px",
        }}
      />
      <h2 className="mt-3">{name}</h2>
      {role && <p className="text-dark">{role}</p>}

      {/* Contact Info (stacked) */}
      <div className="mt-3">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <FaPhone className="social-icon" size={18} />
          <span>{phone_number || "Not available"}</span>
        </div>
        <div className="d-flex justify-content-center align-items-center gap-2">
          <FaEnvelope className="social-icon" size={18} />
          <span>{email || "Not available"}</span>
        </div>
      </div>

      {/* Social Media */}
      <div className="d-flex justify-content-center gap-4 mt-4">
        <a
          href={facebook || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={facebook ? "text-primary" : "text-muted"}
        >
          <FaFacebookF className="social-icon" size={18} />
        </a>
        <a
          href={instagram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={instagram ? "text-danger" : "text-muted"}
        >
          <FaInstagram className="social-icon" size={18} />
        </a>
        <a
          href={youtube || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={youtube ? "text-danger" : "text-muted"}
        >
          <FaYoutube className="social-icon" size={18} />
        </a>
        <a
          href={tiktok || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={tiktok ? "text-dark" : "text-muted"}
        >
          <FaTiktok className="social-icon" size={18} />
        </a>
      </div>
    </div>
  );
}


/*
"use client";

type Props = {
  url: string | null;
  name: string;
};

export default function ProfileImage({ url, name }: Props) {
  return (
    <div className="text-center mb-4">
      <img
        src={url || "/images/default-avatar.png"}
        alt={name}
        className="rounded-circle border border-4 shadow"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "cover",
          marginTop: "-80px",
        }}
      />
      <h2 className="mt-3">{name}</h2>
    </div>
  );
}

*/
