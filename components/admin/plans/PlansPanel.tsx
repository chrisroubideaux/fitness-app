// components/admin/plans/PlansPanel.tsx
// components/admin/plans/PlansPanel.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaEdit,
  FaTrashAlt,
  FaChevronLeft,
  FaPlus,
  FaTags,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaDumbbell,
  FaAppleAlt,
  FaEnvelope,
  FaHeadphones,
  FaSpa,
  FaPen,
  FaSyncAlt,
  FaVideo,
  FaStopwatch,
  FaLink,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaBell,
  FaRedoAlt,
  FaPhone,
  FaBullseye,
  FaRobot,
  FaBox,
  FaChalkboardTeacher,
  FaBandAid,
  FaChartBar,
  FaBrain,
  FaBolt,
  FaPuzzlePiece,
  FaLock,
  FaGlobe,
  FaRegCircle,
  FaCalendarAlt,
  FaComments,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';

export type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  features: string[];
};

function toMoney(n: number | null | undefined) {
  if (n == null) return '';
  return Number(n).toFixed(2);
}

type Page = 0 | 1;

const ORDER_NAMES = ['Basic', 'Pro', 'Elite', 'Custom Coaching'];
const ORDER_MAP = new Map(
  ORDER_NAMES.map((t, i) => [t.trim().toLowerCase(), i])
);
const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

function sortPlans(list: Plan[]): Plan[] {
  const BIG = 1e9;
  return [...list].sort((a, b) => {
    const aw = ORDER_MAP.get(norm(a.name)) ?? BIG;
    const bw = ORDER_MAP.get(norm(b.name)) ?? BIG;
    if (aw !== bw) return aw - bw;
    return a.name.trim().localeCompare(b.name.trim());
  });
}

const featureIconMap: Record<string, IconType> = {
  '✅': FaCheckCircle,
  '❌': FaTimesCircle,
  '🏋️‍♀️': FaDumbbell,
  '🏋️': FaDumbbell,
  '🍎': FaAppleAlt,
  '📩': FaEnvelope,
  '📧': FaEnvelope,
  '✉️': FaEnvelope,
  '🎧': FaHeadphones,
  '🧘‍♂️': FaSpa,
  '🧘': FaSpa,
  '📝': FaPen,
  '🔁': FaSyncAlt,
  '🎥': FaVideo,
  '⏱️': FaStopwatch,
  '🔗': FaLink,
  '🏆': FaTrophy,
  '👥': FaUsers,
  '📈': FaChartLine,
  '📊': FaChartBar,
  '🛎️': FaBell,
  '🔄': FaRedoAlt,
  '📞': FaPhone,
  '🎯': FaBullseye,
  '🤖': FaRobot,
  '📦': FaBox,
  '🧑‍🏫': FaChalkboardTeacher,
  '🩹': FaBandAid,
  '🧠': FaBrain,
  '⚡': FaBolt,
  '🧩': FaPuzzlePiece,
  '🔒': FaLock,
  '🌐': FaGlobe,
  '📅': FaCalendarAlt,
  '📆': FaCalendarAlt,
  '🗓️': FaCalendarAlt,
  '💬': FaComments,
  '🗨️': FaComments,
  '💭': FaComments,
};

function parseFeature(feature: string): { Icon: IconType; text: string } {
  if (!feature) return { Icon: FaRegCircle, text: '' };

  for (const emoji of Object.keys(featureIconMap)) {
    if (feature.startsWith(emoji)) {
      const Icon = featureIconMap[emoji] || FaRegCircle;
      const text = feature.slice(emoji.length).trim();
      return { Icon, text };
    }
  }

  return { Icon: FaRegCircle, text: feature.trim() };
}

export default function PlansPanel() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<Page>(0);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const token = useMemo(
    () =>
      typeof window === 'undefined' ? null : localStorage.getItem('adminToken'),
    []
  );

  const validation = useMemo(() => {
    if (!editing) {
      return { valid: true, errors: {} as { name?: string; price?: string } };
    }

    const errors: { name?: string; price?: string } = {};
    const name = (editing.name ?? '').trim();
    const price = Number.isFinite(editing.price)
      ? Number(editing.price)
      : NaN;

    if (!name) errors.name = 'Name is required.';
    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'Price must be 0 or greater.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }, [editing]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${apiBase}/api/memberships/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!res.ok) throw new Error(`GET /memberships/ -> ${res.status}`);

        const data = await res.json();
        setPlans(sortPlans(Array.isArray(data) ? (data as Plan[]) : []));
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [apiBase, token]);

  const openCreate = () => {
    setEditing({ id: '', name: '', description: '', price: 0, features: [] });
    setPage(1);
  };

  const openEdit = (plan: Plan) => {
    setEditing({ ...plan, features: [...(plan.features || [])] });
    setPage(1);
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsSaving(false);
    setPage(0);
  };

  const savePlan = async () => {
    if (!editing) return;
    if (!validation.valid) return;

    setIsSaving(true);

    const isNew = !editing.id;

    const body = {
      name: editing.name.trim(),
      description: (editing.description ?? '').trim(),
      price: Number(editing.price) || 0,
      features: (editing.features ?? [])
        .map((f) => (f ?? '').trim())
        .filter(Boolean),
    };

    const url = isNew
      ? `${apiBase}/api/memberships/`
      : `${apiBase}/api/memberships/${editing.id}`;

    const method = isNew ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}`);

      const saved = (await res.json()) as Plan;

      setPlans((prev) =>
        sortPlans(
          isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))
        )
      );

      cancelEdit();
    } catch (e) {
      console.error(e);
      alert('Failed to save plan. Please try again.');
      setIsSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${apiBase}/api/memberships/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!res.ok) throw new Error(`DELETE /memberships/${id} -> ${res.status}`);

      setPlans((prev) => sortPlans(prev.filter((p) => p.id !== id)));
    } catch (e) {
      console.error(e);
      alert('Failed to delete plan.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderList = () => (
    <>
      <div
        className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-start"
        style={{ gap: '1rem', marginBottom: '1.25rem' }}
      >
        <div>
          <span style={pillStyle}>
            <FaTags />
            Admin Plans
          </span>

          <h2 style={titleStyle}>Membership plan manager</h2>

          <p style={subtitleStyle}>
            Create, edit, sort, and manage membership tiers and feature sets for
            the FitByLena platform.
          </p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: '0.65rem' }}>
          <button type="button" onClick={openCreate} style={primaryButtonStyle}>
            <FaPlus />
            New Plan
          </button>

          <button
            type="button"
            onClick={() => setShowPromo((s) => !s)}
            style={secondaryButtonStyle}
          >
            {showPromo ? <FaTimes /> : <FaTags />}
            {showPromo ? 'Hide Promos' : 'Promos'}
          </button>
        </div>
      </div>

      {loading && (
        <div
          style={{
            minHeight: 260,
            borderRadius: 30,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.85), rgba(255,255,255,0.55))',
            border: '1px solid rgba(139,92,246,0.08)',
            boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
          }}
        />
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 22,
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.16)',
            color: '#b91c1c',
            fontWeight: 800,
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="row g-4">
          {plans.map((p, index) => (
            <div key={p.id} className="col-12 col-lg-6 col-xxl-4">
              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 18px 42px rgba(15,23,42,0.10)',
                }}
                style={{
                  height: '100%',
                  borderRadius: 30,
                  overflow: 'hidden',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '1.25rem',
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.13), rgba(96,165,250,0.10))',
                    borderBottom: '1px solid rgba(139,92,246,0.08)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: '#111827',
                          fontWeight: 950,
                          fontSize: '1.25rem',
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {p.name}
                      </h3>

                      <div
                        style={{
                          color: '#8b5cf6',
                          fontWeight: 950,
                          fontSize: '1.75rem',
                          marginTop: 8,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        ${toMoney(p.price)}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.38rem 0.7rem',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.76)',
                        color: '#475569',
                        fontWeight: 850,
                        fontSize: '0.74rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.features?.length ?? 0} features
                    </span>
                  </div>

                  {p.description && (
                    <p
                      style={{
                        color: '#64748b',
                        margin: '0.85rem 0 0',
                        lineHeight: 1.7,
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                </div>

                <div style={{ padding: '1.25rem', flex: 1 }}>
                  {p.features?.length ? (
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: '0.75rem',
                      }}
                    >
                      {p.features.slice(0, 4).map((f, i) => {
                        const { Icon, text } = parseFeature(f);

                        return (
                          <li
                            key={`${p.id}-f-${i}`}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.65rem',
                              color: '#475569',
                              lineHeight: 1.6,
                              fontWeight: 650,
                            }}
                          >
                            <span style={featureIconStyle}>
                              <Icon size={14} />
                            </span>
                            <span>{text}</span>
                          </li>
                        );
                      })}

                      {p.features.length > 4 && (
                        <li
                          style={{
                            color: '#64748b',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                          }}
                        >
                          +{p.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p style={{ color: '#64748b', fontWeight: 700 }}>
                      No features added yet.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    padding: '0 1.25rem 1.25rem',
                    display: 'flex',
                    gap: '0.65rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    style={secondaryButtonStyle}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePlan(p.id)}
                    disabled={deletingId === p.id}
                    style={{
                      ...dangerButtonStyle,
                      opacity: deletingId === p.id ? 0.72 : 1,
                      cursor: deletingId === p.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingId === p.id ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FaTrashAlt />
                    )}
                    Delete
                  </button>
                </div>
              </motion.article>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-12">
              <div
                style={{
                  borderRadius: 30,
                  padding: '2rem',
                  background: 'rgba(255,255,255,0.82)',
                  border: '1px solid rgba(139,92,246,0.08)',
                  textAlign: 'center',
                  color: '#64748b',
                  fontWeight: 800,
                }}
              >
                No plans yet.
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showPromo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              marginTop: '1.25rem',
              borderRadius: 30,
              padding: '1.25rem',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          >
            <h3
              style={{
                color: '#111827',
                fontWeight: 950,
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
              }}
            >
              Promotions / Coupons
            </h3>

            <p style={{ color: '#64748b', lineHeight: 1.75, margin: 0 }}>
              Placeholder for managing promo codes, discounts, validity windows,
              usage limits, and plan associations. Suggested endpoints:{' '}
              <code>GET/POST/PATCH/DELETE /api/promotions/</code>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const renderEditor = () =>
    editing && (
      <>
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
          style={{ gap: '1rem', marginBottom: '1.25rem' }}
        >
          <div>
            <span style={pillStyle}>
              <FaPen />
              {editing.id ? 'Edit Plan' : 'Create Plan'}
            </span>

            <h2 style={titleStyle}>
              {editing.id ? 'Update membership plan' : 'Create membership plan'}
            </h2>

            <p style={subtitleStyle}>
              Manage pricing, descriptions, and feature lists for this tier.
            </p>
          </div>

          <button type="button" onClick={cancelEdit} style={secondaryButtonStyle}>
            <FaChevronLeft />
            Back
          </button>
        </div>

        <div
          style={{
            borderRadius: 30,
            padding: 'clamp(1rem, 3vw, 1.35rem)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
            border: '1px solid rgba(139,92,246,0.08)',
            boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
          }}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label style={labelStyle}>Name</label>
              <input
                style={{
                  ...inputStyle,
                  borderColor: validation.errors.name
                    ? 'rgba(239,68,68,0.42)'
                    : inputStyle.borderColor,
                }}
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
              {validation.errors.name && (
                <div style={invalidStyle}>{validation.errors.name}</div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label style={labelStyle}>Price (USD)</label>
              <input
                style={{
                  ...inputStyle,
                  borderColor: validation.errors.price
                    ? 'rgba(239,68,68,0.42)'
                    : inputStyle.borderColor,
                }}
                type="number"
                step="0.01"
                min="0"
                value={toMoney(editing.price)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price: Number(e.target.value || 0),
                  })
                }
              />
              {validation.errors.price && (
                <div style={invalidStyle}>{validation.errors.price}</div>
              )}
            </div>

            <div className="col-12">
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 110, paddingTop: '0.9rem' }}
                rows={3}
                value={editing.description ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>

            <div className="col-12">
              <label style={labelStyle}>Features</label>
              <FeatureEditor
                features={editing.features ?? []}
                onAdd={(t) => {
                  const tt = t.trim();
                  if (!tt) return;
                  setEditing({
                    ...editing,
                    features: [...(editing.features ?? []), tt],
                  });
                }}
                onRemove={(i) => {
                  const next = [...(editing.features ?? [])];
                  next.splice(i, 1);
                  setEditing({ ...editing, features: next });
                }}
              />
            </div>
          </div>

          <div
            className="d-flex justify-content-end flex-wrap"
            style={{ gap: '0.75rem', marginTop: '1.25rem' }}
          >
            <button type="button" onClick={cancelEdit} style={secondaryButtonStyle}>
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              onClick={savePlan}
              disabled={isSaving || !validation.valid}
              style={{
                ...primaryButtonStyle,
                opacity: isSaving || !validation.valid ? 0.7 : 1,
                cursor: isSaving || !validation.valid ? 'not-allowed' : 'pointer',
              }}
            >
              <FaSave />
              {isSaving ? 'Saving…' : editing.id ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </div>
      </>
    );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{
        width: '100%',
        borderRadius: 38,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
        boxShadow:
          '0 18px 45px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.45)',
        position: 'relative',
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
          padding: 'clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        {page === 0 ? renderList() : renderEditor()}
      </div>
    </motion.section>
  );
}

function FeatureEditor({
  features,
  onAdd,
  onRemove,
}: {
  features: string[];
  onAdd: (text: string) => void;
  onRemove: (idx: number) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div>
      <div
        className="d-flex flex-column flex-md-row"
        style={{ gap: '0.75rem', marginBottom: '1rem' }}
      >
        <input
          style={inputStyle}
          placeholder="e.g. ✅ Unlimited workouts, 🧠 AI coaching"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(value);
              setValue('');
            }
          }}
        />

        <button
          type="button"
          onClick={() => {
            onAdd(value);
            setValue('');
          }}
          style={primaryButtonStyle}
        >
          <FaPlus />
          Add
        </button>
      </div>

      {features.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {features.map((f, i) => {
            const { Icon, text } = parseFeature(f);

            return (
              <div
                key={`${f}-${i}`}
                className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                style={{
                  gap: '0.75rem',
                  padding: '0.9rem 1rem',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(139,92,246,0.08)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    color: '#475569',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={featureIconStyle}>
                    <Icon size={14} />
                  </span>
                  {text}
                </span>

                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  style={dangerButtonStyle}
                >
                  <FaTimes />
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '1rem',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.64)',
            border: '1px solid rgba(139,92,246,0.08)',
            color: '#64748b',
            fontWeight: 750,
          }}
        >
          No features added yet.
        </div>
      )}
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0.4rem 0.75rem',
  borderRadius: 999,
  background: 'rgba(139,92,246,0.10)',
  color: '#8b5cf6',
  fontWeight: 800,
  fontSize: '0.76rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.7rem',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: '#111827',
  fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
  fontWeight: 950,
  letterSpacing: '-0.04em',
};

const subtitleStyle: React.CSSProperties = {
  margin: '0.55rem 0 0',
  color: '#64748b',
  lineHeight: 1.7,
  maxWidth: 760,
};

const featureIconStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  minWidth: 24,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(139,92,246,.12)',
  color: '#8b5cf6',
  marginTop: 1,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  color: '#475569',
  fontSize: '0.82rem',
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 46,
  borderRadius: 16,
  border: '1px solid rgba(139,92,246,0.14)',
  background: '#ffffff',
  color: '#334155',
  fontWeight: 750,
  padding: '0 0.9rem',
  outline: 'none',
};

const invalidStyle: React.CSSProperties = {
  marginTop: 6,
  color: '#dc2626',
  fontSize: '0.82rem',
  fontWeight: 800,
};

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0.8rem 1rem',
  borderRadius: 15,
  border: '1px solid transparent',
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  color: '#ffffff',
  fontWeight: 850,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
  boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
};

const secondaryButtonStyle: React.CSSProperties = {
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
  cursor: 'pointer',
};

const dangerButtonStyle: React.CSSProperties = {
  minHeight: 42,
  padding: '0.75rem 0.95rem',
  borderRadius: 14,
  border: '1px solid rgba(239,68,68,0.16)',
  background: 'rgba(254,242,242,0.92)',
  color: '#dc2626',
  fontWeight: 850,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
};

{/*
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaEdit,
  FaTrashAlt,
  FaChevronLeft,
  FaPlus,
  FaTags,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaDumbbell,
  FaAppleAlt,
  FaEnvelope,
  FaHeadphones,
  FaSpa,
  FaPen,
  FaSyncAlt,
  FaVideo,
  FaStopwatch,
  FaLink,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaBell,
  FaRedoAlt,
  FaPhone,
  FaBullseye,
  FaRobot,
  FaBox,
  FaChalkboardTeacher,
  FaBandAid,
  FaChartBar,
  FaBrain,
  FaBolt,
  FaPuzzlePiece,
  FaLock,
  FaGlobe,
  FaRegCircle,
  FaCalendarAlt,
  FaComments,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

export type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  features: string[];
};

function toMoney(n: number | null | undefined) {
  if (n == null) return '';
  return Number(n).toFixed(2);
}

type Page = 0 | 1; // 0 = list, 1 = editor

// ---- Robust tier order (trim + lowercase) -------------------------------
const ORDER_NAMES = ['Basic', 'Pro', 'Elite', 'Custom Coaching'];
const ORDER_MAP = new Map(ORDER_NAMES.map((t, i) => [t.trim().toLowerCase(), i]));
const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

function sortPlans(list: Plan[]): Plan[] {
  const BIG = 1e9;
  return [...list].sort((a, b) => {
    const aw = ORDER_MAP.get(norm(a.name)) ?? BIG;
    const bw = ORDER_MAP.get(norm(b.name)) ?? BIG;
    if (aw !== bw) return aw - bw; 
    return a.name.trim().localeCompare(b.name.trim());
  });
}

// ---- Emoji → Icon mapping (includes calendar + message) -----------------
const featureIconMap: Record<string, IconType> = {
  '✅': FaCheckCircle,
  '❌': FaTimesCircle,
  '🏋️‍♀️': FaDumbbell,
  '🏋️': FaDumbbell,
  '🍎': FaAppleAlt,
  '📩': FaEnvelope,
  '📧': FaEnvelope,
  '✉️': FaEnvelope,
  '🎧': FaHeadphones,
  '🧘‍♂️': FaSpa,
  '🧘': FaSpa,
  '📝': FaPen,
  '🔁': FaSyncAlt,
  '🎥': FaVideo,
  '⏱️': FaStopwatch,
  '🔗': FaLink,
  '🏆': FaTrophy,
  '👥': FaUsers,
  '📈': FaChartLine,
  '📊': FaChartBar,
  '🛎️': FaBell,
  '🔄': FaRedoAlt,
  '📞': FaPhone,
  '🎯': FaBullseye,
  '🤖': FaRobot,
  '📦': FaBox,
  '🧑‍🏫': FaChalkboardTeacher,
  '🩹': FaBandAid,
  '🧠': FaBrain,
  '⚡': FaBolt,
  '🧩': FaPuzzlePiece,
  '🔒': FaLock,
  '🌐': FaGlobe,
  '📅': FaCalendarAlt,
  '📆': FaCalendarAlt,
  '🗓️': FaCalendarAlt,
  '💬': FaComments,
  '🗨️': FaComments,
  '💭': FaComments,
};

function parseFeature(feature: string): { Icon: IconType; text: string } {
  if (!feature) return { Icon: FaRegCircle, text: '' };
  for (const emoji of Object.keys(featureIconMap)) {
    if (feature.startsWith(emoji)) {
      const Icon = featureIconMap[emoji] || FaRegCircle;
      const text = feature.slice(emoji.length).trim();
      return { Icon, text };
    }
  }
  return { Icon: FaRegCircle, text: feature.trim() };
}

export default function PlansPanel() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<Page>(0);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const token = useMemo(() => (typeof window === 'undefined' ? null : localStorage.getItem('adminToken')), []);

  const validation = useMemo(() => {
    if (!editing) return { valid: true, errors: {} as { name?: string; price?: string } };
    const errors: { name?: string; price?: string } = {};
    const name = (editing.name ?? '').trim();
    const price = Number.isFinite(editing.price) ? Number(editing.price) : NaN;
    if (!name) errors.name = 'Name is required.';
    if (!Number.isFinite(price) || price < 0) errors.price = 'Price must be 0 or greater.';
    return { valid: Object.keys(errors).length === 0, errors };
  }, [editing]);

  // Fetch + sort
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${apiBase}/api/memberships/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error(`GET /memberships/ -> ${res.status}`);
        const data = await res.json();
        setPlans(sortPlans(Array.isArray(data) ? (data as Plan[]) : []));
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiBase, token]);

  // Actions
  const openCreate = () => {
    setEditing({ id: '', name: '', description: '', price: 0, features: [] });
    setPage(1);
  };

  const openEdit = (plan: Plan) => {
    setEditing({ ...plan, features: [...(plan.features || [])] });
    setPage(1);
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsSaving(false);
    setPage(0);
  };

  const savePlan = async () => {
    if (!editing) return;
    if (!validation.valid) return;
    setIsSaving(true);
    const isNew = !editing.id;

    const body = {
      name: editing.name.trim(),
      description: (editing.description ?? '').trim(),
      price: Number(editing.price) || 0,
      features: (editing.features ?? []).map((f) => (f ?? '').trim()).filter(Boolean),
    };

    const url = isNew ? `${apiBase}/api/memberships/` : `${apiBase}/api/memberships/${editing.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}`);

      const saved = (await res.json()) as Plan;
      setPlans((prev) =>
        sortPlans(isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))),
      );
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert('Failed to save plan. Please try again.');
      setIsSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBase}/api/memberships/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error(`DELETE /memberships/${id} -> ${res.status}`);
      setPlans((prev) => sortPlans(prev.filter((p) => p.id !== id)));
    } catch (e) {
      console.error(e);
      alert('Failed to delete plan.');
    } finally {
      setDeletingId(null);
    }
  };

  // UI
  const renderList = () => (
    <>
    <div className="mb-3">
      <div className="admin-header shadow-lg">
        <h5 className="mb-0 fs-4">Membership Plans</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-md btn-slim" onClick={openCreate}>
            <FaPlus className="me-1" aria-hidden /> New Plan
          </button>
          <button className="btn btn-md btn-slim" onClick={() => setShowPromo((s) => !s)}>
            {showPromo ? (
              <>
                <FaTimes className="me-1" aria-hidden /> Hide
              </>
            ) : (
              <>
                <FaTags className="me-1" aria-hidden /> Promos
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <p>Loading plans…</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive bg-transparent shadow-sm rounded">
          <table className="table table-sm align-middle table-glass bg-transparent">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (USD)</th>
                <th>Features</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {plans.map((p) => (
                <tr key={p.id}>
                  <td className="list">
                    <div className="">
                        <h5 className='fw-bold fs-6'>{p.name}</h5>
                    </div>
                    {p.description && (
                      <div className="text-muted small" style={{ maxWidth: 420 }}>
                        <p className='par fs-6'>{p.description}</p>
                      </div>
                    )}
                  </td>
                  <td>${toMoney(p.price)}</td>
                  <td>
                    {p.features?.length ? (
                      <ul className="mb-0 small admin-feature-list">
                        {p.features.slice(0, 3).map((f, i) => {
                          const { Icon, text } = parseFeature(f);
                          return (
                            <li key={`${p.id}-f-${i}`} className="d-flex align-items-start gap-2">
                              <Icon className=" fs-6 bio-icon mt-1" aria-hidden />
                              <span>{text}</span>
                            </li>
                          );
                        })}
                        {p.features.length > 3 && (
                          <li className="text-muted">…and {p.features.length - 3} more</li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-muted small">No features</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group" aria-label="Row actions">
                      <button
                        className="btn btn-ghost btn-ghost-neutral icon-btn-slim"
                        title="Edit plan"
                        aria-label="Edit plan"
                        onClick={() => openEdit(p)}
                      >
                        <FaEdit aria-hidden />
                      </button>
                      <button
                        className="btn btn-ghost btn-ghost-danger icon-btn-slim"
                        title="Delete plan"
                        aria-label="Delete plan"
                        onClick={() => deletePlan(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        ) : (
                          <FaTrashAlt aria-hidden />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No plans yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showPromo && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Promotions / Coupons</h5>
            <p className="text-muted mb-0">
              Placeholder for managing promo codes, discounts, validity windows, usage limits, and
              plan associations. Suggested endpoints: <code>GET/POST/PATCH/DELETE /api/promotions/</code>.
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );

  const renderEditor = () =>
    editing && (
      <>
        <div className="d-flex align-items-center gap-2 mb-3">
          <button className="btn btn-outline-secondary btn-slim" onClick={cancelEdit}>
            <FaChevronLeft className="me-1" aria-hidden /> Back
          </button>
          <h4 className="mb-0">{editing.id ? 'Edit Plan' : 'Create Plan'}</h4>
        </div>

        <div className="card bg-transparent">
          <div className="card-body ">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className={`form-control ${validation.errors.name ? 'is-invalid' : ''}`}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                {validation.errors.name && <div className="invalid-feedback">{validation.errors.name}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Price (USD)</label>
                <input
                  className={`form-control ${validation.errors.price ? 'is-invalid' : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={toMoney(editing.price)}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value || 0) })}
                />
                {validation.errors.price && <div className="invalid-feedback">{validation.errors.price}</div>}
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Features</label>
                <FeatureEditor
                  features={editing.features ?? []}
                  onAdd={(t) => {
                    const tt = t.trim();
                    if (!tt) return;
                    setEditing({ ...editing, features: [...(editing.features ?? []), tt] });
                  }}
                  onRemove={(i) => {
                    const next = [...(editing.features ?? [])];
                    next.splice(i, 1);
                    setEditing({ ...editing, features: next });
                  }}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-md btn-slim" onClick={cancelEdit}>
                <FaTimes className="me-1" aria-hidden /> Cancel
              </button>
              <button className="btn btn-md btn-slim" onClick={savePlan} disabled={isSaving || !validation.valid}>
                <FaSave className="me-1" aria-hidden />
                {isSaving ? 'Saving…' : editing.id ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      </>
    );

  return <div className="admin-plans">{page === 0 ? renderList() : renderEditor()}</div>;
}

function FeatureEditor({
  features,
  onAdd,
  onRemove,
}: {
  features: string[];
  onAdd: (text: string) => void;
  onRemove: (idx: number) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div>
      <div className="d-flex gap-2 mb-2">
        <input
          className="form-control"
          placeholder="e.g. Unlimited workouts, 1:1 coaching"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(value);
              setValue('');
            }
          }}
        />
        <button
          className="btn btn-outline-primary btn-slim"
          type="button"
          onClick={() => {
            onAdd(value);
            setValue('');
          }}
        >
          <FaPlus className="me-1" aria-hidden /> Add
        </button>
      </div>

      {features.length > 0 ? (
        <ul className="list-group bg-transparent mb-0 pt-3">
          {features.map((f, i) => {
            const { Icon, text } = parseFeature(f);
            return (
              <li
                key={`${f}-${i}`}
                className="bg-transparent list-group-item d-flex justify-content-between align-items-center"
              >
                <span className="d-flex align-items-start gap-2">
                  <Icon aria-hidden className="mt-1 bio-icon" />
                  <span className='fs-6 text-gray'> {text}</span>
                </span>
                <button className="btn btn-outline-danger btn-slim" onClick={() => onRemove(i)}>
                  <FaTimes className="me-1" aria-hidden /> Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-muted small">No features added yet.</div>
      )}
    </div>
  );
}

*/}