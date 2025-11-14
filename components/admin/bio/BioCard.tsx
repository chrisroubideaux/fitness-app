/* components/admin/bio/BioCard.tsx */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInfo,
  FiAward,
  FiCamera,
} from "react-icons/fi";

/** --- Types --- */
export type Admin = {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  phone_number: string | null;
  address: string | null;
  membership_plan_id: string | null;
  bio: string | null;
};

type ServerAdmin = {
  admin_id?: string;
  id?: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  address: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  membership_plan_id: string | null;
};

type Props = {
  admin: Admin;
  className?: string;
  onSaved?: (updated: Admin) => void;
  apiBase?: string;
};

/** --- Utils --- */
function initialsOf(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function normalizeServerAdmin(s: ServerAdmin): Admin {
  const id = s.id ?? s.admin_id ?? "";
  return {
    id,
    full_name: s.full_name,
    email: s.email,
    bio: s.bio,
    address: s.address,
    phone_number: s.phone_number ?? null,
    profile_image_url: s.profile_image_url ?? null,
    membership_plan_id: s.membership_plan_id,
  };
}

/** --- Component --- */
export default function AdminBioCard({
  admin,
  className,
  onSaved,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState(admin.full_name ?? "");
  const [email] = useState(admin.email ?? "");
  const [phone, setPhone] = useState(admin.phone_number ?? "");
  const [address, setAddress] = useState(admin.address ?? "");
  const [bio, setBio] = useState(admin.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(
    admin.profile_image_url ?? ""
  );

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  /** Reset when admin changes */
  useEffect(() => {
    setFullName(admin.full_name ?? "");
    setPhone(admin.phone_number ?? "");
    setAddress(admin.address ?? "");
    setBio(admin.bio ?? "");
    setAvatarUrl(admin.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }, [admin]);

  /** Preview file */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);
    return () => URL.revokeObjectURL(obj);
  }, [file]);

  /** Alerts */
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [error, success]);

  const shownAvatar = previewUrl || avatarUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image too large (max 5MB).");
      return;
    }
    setFile(f);
  }

  async function uploadImageIfNeeded(): Promise<string> {
    if (file) {
      const fd = new FormData();
      fd.append("image", file); // backend expects 'image'
      const res = await fetch(`${base}/api/admins/upload-profile`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");
      return data.url ?? data.profile_image_url;
    }
    return avatarUrl;
  }

  function handleCancel() {
    setFullName(admin.full_name ?? "");
    setPhone(admin.phone_number ?? "");
    setAddress(admin.address ?? "");
    setBio(admin.bio ?? "");
    setAvatarUrl(admin.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("No admin token. Please log in again.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const finalAvatarUrl = await uploadImageIfNeeded();

      const payload = {
        full_name: fullName || null,
        bio: bio || null,
        address: address || null,
        phone: phone || null,
        profile_image: finalAvatarUrl || null,
      };

      const res = await fetch(`${base}/api/admins/${admin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      const updatedAdmin = normalizeServerAdmin(data as ServerAdmin);

      setSuccess("Admin profile updated!");
      setIsEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setAvatarUrl(updatedAdmin.profile_image_url ?? "");
      onSaved?.(updatedAdmin);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save admin profile."
      );
    } finally {
      setSaving(false);
    }
  }

  const disableFields = !isEditing || saving;

  return (
    <motion.div
      key={admin.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card shadow-sm chart-gradient bio-card mx-auto ${
        className ?? ""
      }`}
      style={{ borderRadius: 16, maxWidth: 600, width: "100%" }}
    >
      <div className="card-body">
        <AnimatePresence>
          {error && (
            <motion.div
              className="bio-alert bio-alert--error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="bio-alert bio-alert--success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          {/* Avatar */}
          <div className="d-flex flex-column align-items-center text-center mb-3">
            <div className="bio-avatar">
              {shownAvatar ? (
                <img
                  src={shownAvatar}
                  alt={fullName || "Profile"}
                  className="bio-avatar__img"
                />
              ) : (
                <div className="bio-avatar__placeholder">
                  {initialsOf(fullName)}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="d-none"
              />

              <button
                type="button"
                className={`bio-avatar__edit ${saving ? "is-disabled" : ""}`}
                onClick={() => {
                  if (!isEditing) setIsEditing(true);
                  fileInputRef.current?.click();
                }}
                disabled={saving}
              >
                <FiCamera size={16} />
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="mb-2">
            <label className="form-label mb-1">Full Name</label>
            <div className="bio-row">
              <FiUser className="bio-row__icon" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={disableFields}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Email</label>
            <div className="bio-row">
              <FiMail className="bio-row__icon" />
              <input
                type="email"
                className="form-control form-control-sm bio-row__control"
                value={email}
                readOnly
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Phone</label>
            <div className="bio-row">
              <FiPhone className="bio-row__icon" />
              <input
                type="tel"
                className="form-control form-control-sm bio-row__control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={disableFields}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Address</label>
            <div className="bio-row">
              <FiMapPin className="bio-row__icon" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={disableFields}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Bio</label>
            <div className="bio-row bio-row--textarea">
              <FiInfo className="bio-row__icon" />
              <textarea
                className="form-control bio-textarea bio-row__control"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={disableFields}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Membership Plan</label>
            <div className="bio-row">
              <FiAward className="bio-row__icon" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={admin.membership_plan_id ?? "—"}
                readOnly
              />
            </div>
          </div>

          <hr className="bio-divider" />
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              {isEditing
                ? "Editing enabled — save changes."
                : "Read-only. Click Edit."}
            </div>
            <div className="d-flex gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-thin"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-thin"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-thin"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
