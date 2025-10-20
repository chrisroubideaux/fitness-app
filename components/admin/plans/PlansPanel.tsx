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
              {/* Name */}
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className={`form-control ${validation.errors.name ? 'is-invalid' : ''}`}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                {validation.errors.name && <div className="invalid-feedback">{validation.errors.name}</div>}
              </div>

              {/* Price */}
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

              {/* Description */}
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>

              {/* Features editor */}
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
