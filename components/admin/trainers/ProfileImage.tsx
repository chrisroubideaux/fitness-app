// components/admin/trainers/ProfileImage.tsx
"use client";

import { FaEnvelope, FaPhone, FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

type Props = {
  url: string | null;
  name: string;
  email?: string | null;
  role: string | null;
  phone_number?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
};

export default function ProfileImage({
  url,
  name,
  email,
  role,
  phone_number,
  facebook,
  instagram,
  youtube,
  tiktok,
}: Props) {
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
      {role && <p className="text-muted small">{role}</p>}

      {/* Contact Info */}
      <div className="mt-3 text-muted small">
        {email && (
          <h5 className="mb-1 fs-6">
            <FaEnvelope className="me-2 social-icon" /> {email}
          </h5>
        )}
        {phone_number && (
          <h5 className="mb-1 fs-6">
            <FaPhone className="me-2 social-icon" /> {phone_number}
          </h5>
        )} 
      </div>

      {/* Social Media */}
      <div className="d-flex justify-content-center gap-3 mt-3">
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <FaFacebookF className="social-icon" size={20} />
          </a>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger"
          >
            <FaInstagram className="social-icon" size={20} />
          </a>
        )}
        {youtube && (
          <a
            href={youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger"
          >
            <FaYoutube className="social-icon" size={20} />
          </a>
        )}
        {tiktok && (
          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark"
          >
            <FaTiktok className="social-icon" size={20} />
          </a>
        )}
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
