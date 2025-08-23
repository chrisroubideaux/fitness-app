/* components/profile/bio/BioCard.tsx */
/* components/profile/bio/BioCard.tsx */
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

type ServerUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  address: string | null;
  phone_number?: string | null;
  phone?: string | null;
  profile_image_url?: string | null;
  profile_image?: string | null;
  membership_plan_id: string | null;
};

type Props = {
  user: User;
  className?: string;
  onSaved?: (updated: User) => void;
  apiBase?: string;
  /** Optional multipart upload endpoint returning {url} or {profile_image_url} */
  imageUploadPath?: string;
};

function initialsOf(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function normalizeServerUser(s: ServerUser): User {
  return {
    id: s.id,
    full_name: s.full_name,
    email: s.email,
    bio: s.bio,
    address: s.address,
    phone_number: s.phone_number ?? s.phone ?? null,
    profile_image_url: s.profile_image_url ?? s.profile_image ?? null,
    membership_plan_id: s.membership_plan_id,
  };
}

export default function BioCard({
  user,
  className,
  onSaved,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  imageUploadPath,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [email] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone_number ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user.profile_image_url ?? "");

  // NEW: human-friendly plan name (default to Free if no plan)
  const [planName, setPlanName] = useState<string>(
    user.membership_plan_id ? "Loading…" : "Free"
  );

  // File picking & preview
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null); // fallback if no upload route
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Reset when user changes
  useEffect(() => {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setDataUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
    setPlanName(user.membership_plan_id ? "Loading…" : "Free");
  }, [user]);

  // Build preview + dataURL when selecting a file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDataUrl(null);
      return;
    }
    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
    return () => URL.revokeObjectURL(obj);
  }, [file]);

  // Auto-dismiss alerts
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [error, success]);

  // NEW: Resolve membership plan name from API (with localStorage cache)
  useEffect(() => {
    const currentId = user.membership_plan_id;
    if (!currentId) {
      setPlanName("Free");
      return;
    }

    const cacheKey = "planNames:v1";
    let cached: Record<string, string> = {};
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || "{}");
    } catch {
      cached = {};
    }

    if (cached[currentId]) {
      setPlanName(cached[currentId]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${base}/api/memberships/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          // fallback: show the id if we cannot load names
          setPlanName(currentId);
          return;
        }

        // Normalize: accept either array or {items:[...]} or {data:[...]}
        const arr =
          Array.isArray(data) ? data :
          Array.isArray(data.items) ? data.items :
          Array.isArray(data.data) ? data.data :
          [];

        const map: Record<string, string> = {};
        for (const p of arr) {
          if (p && p.id && p.name) map[p.id] = p.name;
        }

        const name = map[currentId] || currentId;
        setPlanName(name);

        // update cache
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ ...cached, ...map })
          );
        } catch {}
      } catch {
        setPlanName(currentId); // fallback if request fails
      }
    })();
  }, [user.membership_plan_id, base, token]);

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
      setError("Image is too large (max 5MB).");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function uploadImageIfNeeded(): Promise<string> {
    // With upload route: POST the file, use returned URL
    if (imageUploadPath && file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${base}${imageUploadPath}`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Image upload failed (${res.status}): ${text || res.statusText}`);
      }
      const data: { url?: string; profile_image_url?: string } =
        (await res.json().catch(() => ({}))) || {};
      const url = data.url ?? data.profile_image_url ?? "";
      if (!url) throw new Error("Upload succeeded but no URL returned by server.");
      return url;
    }

    // No upload route: send base64 so backend can store it (if you support it)
    if (!imageUploadPath && dataUrl) return dataUrl;

    // No new file: keep existing
    return avatarUrl;
  }

  function handleCancel() {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setDataUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("No token. Please log in again.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const finalAvatarUrl = await uploadImageIfNeeded();

      // Backend expects: full_name, bio, address, phone, profile_image
      const payload = {
        full_name: fullName || null,
        bio: bio || null,
        address: address || null,
        phone: phone || null,
        profile_image: finalAvatarUrl || null,
      };

      const res = await fetch(`${base}/api/users/${encodeURIComponent(user.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const maybeJson = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (maybeJson && (maybeJson.error || maybeJson.message)) ||
          `Update failed (${res.status})`;
        throw new Error(msg);
      }

      let updatedUser: User;
      if (maybeJson && (maybeJson as ServerUser).id) {
        updatedUser = normalizeServerUser(maybeJson as ServerUser);
      } else {
        updatedUser = {
          ...user,
          full_name: payload.full_name,
          bio: payload.bio,
          address: payload.address,
          phone_number: payload.phone,
          profile_image_url: payload.profile_image,
        };
      }

      setSuccess("Profile updated!");
      setIsEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setDataUrl(null);
      setAvatarUrl(updatedUser.profile_image_url ?? "");
      onSaved?.(updatedUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const disableFields = !isEditing || saving;

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card shadow-sm chart-gradient bio-card mx-auto ${className ?? ""}`}
      style={{ borderRadius: 16, maxWidth: 600, width: "100%" }}
    >
      <div className="card-body">
        {/* floating gradient alerts */}
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
          {/* Avatar (camera button is the only trigger) */}
          <div className="d-flex flex-column align-items-center text-center mb-3">
            <div className="bio-avatar">
              {shownAvatar ? (
                <img
                  src={shownAvatar}
                  alt={fullName || "Profile"}
                  className="bio-avatar__img"
                />
              ) : (
                <div className="bio-avatar__placeholder" aria-label="Initials">
                  {initialsOf(fullName || user.full_name)}
                </div>
              )}

              {/* hidden file input (not disabled) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="d-none"
              />

              {/* camera badge — only opens picker when pressed */}
              <button
                type="button"
                className={`bio-avatar__edit ${saving ? "is-disabled" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditing) setIsEditing(true);
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                aria-label="Change photo"
                disabled={saving}
              >
                <FiCamera size={16} />
              </button>
            </div>
          </div>

          {/* Fields with side-by-side icons */}
          <div className="mb-2">
            <label className="form-label mb-1">Full Name</label>
            <div className="bio-row">
              <FiUser className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                disabled={disableFields}
                aria-label="Full name"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Email</label>
            <div className="bio-row">
              <FiMail className="bio-row__icon" aria-hidden="true" />
              <input
                type="email"
                className="form-control form-control-sm bio-row__control"
                value={email}
                readOnly
                aria-readonly="true"
                title="Email is managed by your account provider"
                aria-label="Email"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Phone</label>
            <div className="bio-row">
              <FiPhone className="bio-row__icon" aria-hidden="true" />
              <input
                type="tel"
                className="form-control form-control-sm bio-row__control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                disabled={disableFields}
                aria-label="Phone number"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Address</label>
            <div className="bio-row">
              <FiMapPin className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State"
                disabled={disableFields}
                aria-label="Address"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Bio</label>
            <div className="bio-row bio-row--textarea">
              <FiInfo className="bio-row__icon" aria-hidden="true" />
              <textarea
                className="form-control bio-textarea bio-row__control"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                disabled={disableFields}
                aria-label="Bio"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Membership Plan</label>
            <div className="bio-row">
              <FiAward className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={planName}  
                readOnly
                aria-label="Membership plan"
              />
            </div>
          </div>

          <hr className="bio-divider" />

          {/* Bottom actions */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              {isEditing
                ? "Editing enabled — make your changes then save."
                : "Fields are read-only. Click Edit to make changes."}
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




/*
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

type ServerUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  address: string | null;
  phone_number?: string | null;
  phone?: string | null;
  profile_image_url?: string | null;
  profile_image?: string | null;
  membership_plan_id: string | null;
};

type Props = {
  user: User;
  className?: string;
  onSaved?: (updated: User) => void;
  apiBase?: string;
 
  imageUploadPath?: string;
};

function initialsOf(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function normalizeServerUser(s: ServerUser): User {
  return {
    id: s.id,
    full_name: s.full_name,
    email: s.email,
    bio: s.bio,
    address: s.address,
    phone_number: s.phone_number ?? s.phone ?? null,
    profile_image_url: s.profile_image_url ?? s.profile_image ?? null,
    membership_plan_id: s.membership_plan_id,
  };
}

export default function BioCard({
  user,
  className,
  onSaved,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  imageUploadPath,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [email] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone_number ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user.profile_image_url ?? "");

  // File picking & preview
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null); // fallback if no upload route
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const planLabel = useMemo(() => user.membership_plan_id ?? "Free", [user.membership_plan_id]);

  // Reset when user changes
  useEffect(() => {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setDataUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }, [user]);

  // Build preview + dataURL when selecting a file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDataUrl(null);
      return;
    }
    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
    return () => URL.revokeObjectURL(obj);
  }, [file]);

  // Auto-dismiss alerts
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
      setError("Image is too large (max 5MB).");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function uploadImageIfNeeded(): Promise<string> {
    // With upload route: POST the file, use returned URL
    if (imageUploadPath && file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${base}${imageUploadPath}`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Image upload failed (${res.status}): ${text || res.statusText}`);
      }
      const data: { url?: string; profile_image_url?: string } =
        (await res.json().catch(() => ({}))) || {};
      const url = data.url ?? data.profile_image_url ?? "";
      if (!url) throw new Error("Upload succeeded but no URL returned by server.");
      return url;
    }

    // No upload route: send base64 so backend can store it (if you support it)
    if (!imageUploadPath && dataUrl) return dataUrl;

    // No new file: keep existing
    return avatarUrl;
  }

  function handleCancel() {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setDataUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("No token. Please log in again.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const finalAvatarUrl = await uploadImageIfNeeded();

      // Backend expects: full_name, bio, address, phone, profile_image
      const payload = {
        full_name: fullName || null,
        bio: bio || null,
        address: address || null,
        phone: phone || null,
        profile_image: finalAvatarUrl || null,
      };

      const res = await fetch(`${base}/api/users/${encodeURIComponent(user.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const maybeJson = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (maybeJson && (maybeJson.error || maybeJson.message)) ||
          `Update failed (${res.status})`;
        throw new Error(msg);
      }

      let updatedUser: User;
      if (maybeJson && (maybeJson as ServerUser).id) {
        updatedUser = normalizeServerUser(maybeJson as ServerUser);
      } else {
        updatedUser = {
          ...user,
          full_name: payload.full_name,
          bio: payload.bio,
          address: payload.address,
          phone_number: payload.phone,
          profile_image_url: payload.profile_image,
        };
      }

      setSuccess("Profile updated!");
      setIsEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setDataUrl(null);
      setAvatarUrl(updatedUser.profile_image_url ?? "");
      onSaved?.(updatedUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const disableFields = !isEditing || saving;

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card shadow-sm chart-gradient bio-card mx-auto ${className ?? ""}`}
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
        
          <div className="d-flex flex-column align-items-center text-center mb-3">
            <div className="bio-avatar">
              {shownAvatar ? (
                <img
                  src={shownAvatar}
                  alt={fullName || "Profile"}
                  className="bio-avatar__img"
                />
              ) : (
                <div className="bio-avatar__placeholder" aria-label="Initials">
                  {initialsOf(fullName || user.full_name)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditing) setIsEditing(true);
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                aria-label="Change photo"
                disabled={saving}
              >
                <FiCamera size={16} />
              </button>
            </div>
          </div>

       
          <div className="mb-2">
            <label className="form-label mb-1">Full Name</label>
            <div className="bio-row">
              <FiUser className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                disabled={disableFields}
                aria-label="Full name"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Email</label>
            <div className="bio-row">
              <FiMail className="bio-row__icon" aria-hidden="true" />
              <input
                type="email"
                className="form-control form-control-sm bio-row__control"
                value={email}
                readOnly
                aria-readonly="true"
                title="Email is managed by your account provider"
                aria-label="Email"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Phone</label>
            <div className="bio-row">
              <FiPhone className="bio-row__icon" aria-hidden="true" />
              <input
                type="tel"
                className="form-control form-control-sm bio-row__control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                disabled={disableFields}
                aria-label="Phone number"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Address</label>
            <div className="bio-row">
              <FiMapPin className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State"
                disabled={disableFields}
                aria-label="Address"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Bio</label>
            <div className="bio-row bio-row--textarea">
              <FiInfo className="bio-row__icon" aria-hidden="true" />
              <textarea
                className="form-control bio-textarea bio-row__control"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                disabled={disableFields}
                aria-label="Bio"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Membership Plan</label>
            <div className="bio-row">
              <FiAward className="bio-row__icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-sm bio-row__control"
                value={planLabel}
                readOnly
                aria-label="Membership plan"
              />
            </div>
          </div>

          <hr className="bio-divider" />

        
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              {isEditing
                ? "Editing enabled — make your changes then save."
                : "Fields are read-only. Click Edit to make changes."}
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

*/