// components/profile/bio/BioCard.tsx //
// components/profile/bio/BioCard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInfo,
  FiAward,
  FiCamera,
  FiEdit3,
  FiSave,
  FiX,
} from 'react-icons/fi';

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
};

function initialsOf(name: string | null): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
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

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          color: '#475569',
          fontSize: '0.82rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.85rem 1rem',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(139,92,246,0.08)',
          boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            minWidth: 38,
            borderRadius: 13,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.12))',
            color: '#8b5cf6',
          }}
        >
          {icon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}

const controlStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#111827',
  fontSize: '0.98rem',
  fontWeight: 650,
};

export default function BioCard({
  user,
  className,
  onSaved,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.full_name ?? '');
  const [email] = useState(user.email ?? '');
  const [phone, setPhone] = useState(user.phone_number ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.profile_image_url ?? '');

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    setFullName(user.full_name ?? '');
    setPhone(user.phone_number ?? '');
    setAddress(user.address ?? '');
    setBio(user.bio ?? '');
    setAvatarUrl(user.profile_image_url ?? '');
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }, [user]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);

    return () => URL.revokeObjectURL(obj);
  }, [file]);

  useEffect(() => {
    if (!error && !success) return;

    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 2500);

    return () => clearTimeout(t);
  }, [error, success]);

  const shownAvatar = previewUrl || avatarUrl;
  const disableFields = !isEditing || saving;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      setFile(null);
      return;
    }

    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5MB).');
      return;
    }

    setError(null);
    setFile(f);
  }

  async function uploadImage(): Promise<string | null> {
    if (!file) return avatarUrl;

    const fd = new FormData();
    fd.append('image', file);

    const res = await fetch(`${base}/api/users/upload-profile`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Image upload failed (${res.status}): ${text || res.statusText}`
      );
    }

    const data: { url?: string; profile_image_url?: string } =
      (await res.json().catch(() => ({}))) || {};

    return data.url ?? data.profile_image_url ?? null;
  }

  function handleCancel() {
    setFullName(user.full_name ?? '');
    setPhone(user.phone_number ?? '');
    setAddress(user.address ?? '');
    setBio(user.bio ?? '');
    setAvatarUrl(user.profile_image_url ?? '');
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setError('No token. Please log in again.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedUrl = await uploadImage();
      const finalAvatarUrl = uploadedUrl || avatarUrl;

      const payload = {
        full_name: fullName || null,
        bio: bio || null,
        address: address || null,
        phone: phone || null,
        profile_image: finalAvatarUrl || null,
      };

      const res = await fetch(`${base}/api/users/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

      setSuccess('Profile updated!');
      setIsEditing(false);
      setFile(null);
      setPreviewUrl(null);
      setAvatarUrl(updatedUser.profile_image_url ?? '');
      onSaved?.(updatedUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.section
      key={user.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className={className}
      style={{
        width: '100%',
        maxWidth: 1120,
        margin: '0 auto',
        borderRadius: 38,
        overflow: 'hidden',
        position: 'relative',
        background:
          'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
        boxShadow:
          '0 18px 45px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.45)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 28%), radial-gradient(circle at bottom left, rgba(96,165,250,0.08), transparent 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(1.25rem, 3vw, 2rem)',
        }}
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: '1rem',
                padding: '0.9rem 1rem',
                borderRadius: 18,
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.16)',
                color: '#b91c1c',
                fontWeight: 700,
              }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: '1rem',
                padding: '0.9rem 1rem',
                borderRadius: 18,
                background: 'rgba(34,197,94,0.10)',
                border: '1px solid rgba(34,197,94,0.16)',
                color: '#15803d',
                fontWeight: 700,
              }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-xl-4">
              <div
                style={{
                  height: '100%',
                  borderRadius: 30,
                  padding: '1.5rem',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(248,250,252,0.86))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 166,
                    height: 166,
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    position: 'relative',
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(96,165,250,0.14))',
                    padding: 5,
                    boxShadow: '0 18px 38px rgba(15,23,42,0.14)',
                  }}
                >
                  {shownAvatar ? (
                    <img
                      src={shownAvatar}
                      alt={fullName || 'Profile'}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        background: '#fff',
                      }}
                    />
                  ) : (
                    <div
                      aria-label="Initials"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#ffffff',
                        color: '#8b5cf6',
                        fontSize: '2.25rem',
                        fontWeight: 900,
                      }}
                    >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditing) setIsEditing(true);
                      setTimeout(() => fileInputRef.current?.click(), 0);
                    }}
                    aria-label="Change photo"
                    disabled={saving}
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      border: '1px solid rgba(139,92,246,0.14)',
                      background: '#ffffff',
                      color: '#8b5cf6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
                    }}
                  >
                    <FiCamera size={17} />
                  </button>
                </div>

                <h2
                  style={{
                    color: '#111827',
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    marginBottom: 6,
                  }}
                >
                  {fullName || 'Your Profile'}
                </h2>

                <p
                  style={{
                    color: '#64748b',
                    marginBottom: '1rem',
                    fontWeight: 650,
                  }}
                >
                  {email || 'No email listed'}
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0.55rem 0.85rem',
                    borderRadius: 999,
                    background: 'rgba(139,92,246,0.10)',
                    color: '#7c3aed',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                  }}
                >
                  <FiAward />
                  {user.membership_plan_id ? 'Custom Plan' : 'Free Plan'}
                </div>

                <p
                  style={{
                    margin: '1.2rem 0 0',
                    color: '#64748b',
                    lineHeight: 1.75,
                    fontSize: '0.94rem',
                  }}
                >
                  {isEditing
                    ? 'Update your profile details, upload a new photo, then save your changes.'
                    : 'Your profile details are read-only until you enable editing.'}
                </p>
              </div>
            </div>

            <div className="col-12 col-xl-8">
              <div
                style={{
                  height: '100%',
                  borderRadius: 30,
                  padding: '1.5rem',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(248,250,252,0.86))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
                }}
              >
                <div
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                  style={{ gap: '1rem', marginBottom: '1.35rem' }}
                >
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.4rem 0.75rem',
                        borderRadius: 999,
                        background: 'rgba(139,92,246,0.10)',
                        color: '#8b5cf6',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '0.7rem',
                      }}
                    >
                      Profile Details
                    </span>

                    <h3
                      style={{
                        margin: 0,
                        color: '#111827',
                        fontSize: 'clamp(1.45rem, 3vw, 2rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      Personal information
                    </h3>
                  </div>

                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        minHeight: 44,
                        padding: '0.8rem 1rem',
                        borderRadius: 15,
                        border: '1px solid rgba(139,92,246,0.14)',
                        background:
                          'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        color: '#ffffff',
                        fontWeight: 850,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
                      }}
                    >
                      <FiEdit3 />
                      Edit
                    </button>
                  ) : (
                    <div className="d-flex flex-wrap" style={{ gap: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        style={{
                          minHeight: 44,
                          padding: '0.8rem 1rem',
                          borderRadius: 15,
                          border: '1px solid rgba(148,163,184,0.26)',
                          background: '#ffffff',
                          color: '#475569',
                          fontWeight: 850,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <FiX />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          minHeight: 44,
                          padding: '0.8rem 1rem',
                          borderRadius: 15,
                          border: '1px solid transparent',
                          background:
                            'linear-gradient(135deg, #8b5cf6, #a855f7)',
                          color: '#ffffff',
                          fontWeight: 850,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.75 : 1,
                          boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
                        }}
                      >
                        <FiSave />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Full Name" icon={<FiUser />}>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={disableFields}
                        style={controlStyle}
                      />
                    </Field>
                  </div>

                  <div>
                    <Field label="Email" icon={<FiMail />}>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        style={controlStyle}
                      />
                    </Field>
                  </div>

                  <div>
                    <Field label="Phone" icon={<FiPhone />}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={disableFields}
                        style={controlStyle}
                      />
                    </Field>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Address" icon={<FiMapPin />}>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={disableFields}
                        style={controlStyle}
                      />
                    </Field>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Bio" icon={<FiInfo />}>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={disableFields}
                        style={{
                          ...controlStyle,
                          resize: 'vertical',
                          minHeight: 110,
                          lineHeight: 1.7,
                        }}
                      />
                    </Field>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Membership Plan" icon={<FiAward />}>
                      <input
                        type="text"
                        value={user.membership_plan_id ? 'Custom Plan' : 'Free'}
                        readOnly
                        style={controlStyle}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.section>
  );
}

{/*
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

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Reset state when user changes
  useEffect(() => {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }, [user]);

  // Build preview for file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);
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

  async function uploadImage(): Promise<string | null> {
    if (!file) return avatarUrl;

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`${base}/api/users/upload-profile`, {
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
    return data.url ?? data.profile_image_url ?? null;
  }

  function handleCancel() {
    setFullName(user.full_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.profile_image_url ?? "");
    setFile(null);
    setPreviewUrl(null);
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
      const uploadedUrl = await uploadImage();
      const finalAvatarUrl = uploadedUrl || avatarUrl;

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
      className={`card shadow-md chart-gradient bio-card mx-auto ${className ?? ""}`}
      style={{ borderRadius: 16, maxWidth: 700, width: "100%", border: "none" }}
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
                value={user.membership_plan_id ? "Custom Plan" : "Free"}
                readOnly
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
*/}