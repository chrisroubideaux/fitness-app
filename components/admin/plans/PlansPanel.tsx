// components/admin/plans/PlansPanel.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

// ---- Types
export type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number; // dollars (e.g., 29.99)
  features: string[];
};

// Helpers 
function toMoney(n: number | null | undefined) {
  if (n == null) return '';
  return Number(n).toFixed(2);
}

//  Component 
export default function PlansPanel() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  // Promo section (placeholder)
  const [showPromo, setShowPromo] = useState(false);

  // Use the same admin token
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }, []);

  // Fetch plans
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
        // Expecting an array like you pasted
        setPlans(Array.isArray(data) ? (data as Plan[]) : []);
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
    setEditing({
      id: '',
      name: '',
      description: '',
      price: 0,
      features: [],
    });
    setShowModal(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing({ ...plan, features: [...(plan.features || [])] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const upsertPlan = async () => {
    if (!editing) return;
    const isNew = !editing.id;

    const body = {
      name: editing.name?.trim(),
      description: editing.description ?? '',
      price: Number(editing.price) || 0,
      features: editing.features ?? [],
    };

    // Respect trailing slash style
    const url = isNew
      ? `${apiBase}/api/memberships/`
      : `${apiBase}/api/memberships/${editing.id}/`;
    const method = isNew ? 'POST' : 'PATCH';

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

    setPlans((prev) => {
      if (isNew) return [saved, ...prev];
      return prev.map((p) => (p.id === saved.id ? saved : p));
    });
    closeModal();
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    const res = await fetch(`${apiBase}/api/memberships/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!res.ok) throw new Error(`DELETE /memberships/${id}/ -> ${res.status}`);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const onFeatureAdd = (text: string) => {
    if (!editing) return;
    const t = text.trim();
    if (!t) return;
    setEditing({ ...editing, features: [...(editing.features ?? []), t] });
  };

  const onFeatureRemove = (idx: number) => {
    if (!editing) return;
    const next = [...(editing.features ?? [])];
    next.splice(idx, 1);
    setEditing({ ...editing, features: next });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Membership Plans (Admin)</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + New Plan
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowPromo((s) => !s)}>
            {showPromo ? 'Hide' : 'Promos / Coupons'}
          </button>
        </div>
      </div>

      {loading && <p>Loading plans…</p>}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (USD)</th>
                <th>Features</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="fw-semibold">{p.name}</div>
                    {p.description && (
                      <div className="text-muted small" style={{ maxWidth: 420 }}>{p.description}</div>
                    )}
                  </td>
                  <td>${toMoney(p.price)}</td>
                  <td>
                    {p.features?.length ? (
                      <ul className="mb-0 small">
                        {p.features.slice(0, 3).map((f, i) => (
                          <li key={`${p.id}-f-${i}`}>{f}</li>
                        ))}
                        {p.features.length > 3 && <li className="text-muted">…and {p.features.length - 3} more</li>}
                      </ul>
                    ) : (
                      <span className="text-muted small">No features</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-primary" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-outline-danger" onClick={() => deletePlan(p.id)}>Delete</button>
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

      {/* Promo/Coupon placeholder */}
      {showPromo && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Promotions / Coupons</h5>
            <p className="text-muted mb-0">
              Placeholder for managing promo codes, discounts, validity windows, usage limits, and plan associations.
              Suggested endpoints: <code>GET/POST/PATCH/DELETE /api/promotions/</code> with fields like
              <code>code</code>, <code>percent_off</code>/<code>amount_off</code>, <code>starts_at</code>, <code>ends_at</code>,
              <code>max_redemptions</code>, <code>is_active</code>, and <code>applicable_plan_ids</code>.
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && editing && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing.id ? 'Edit Plan' : 'Create Plan'}</h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Price (USD)</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      min="0"
                      value={toMoney(editing.price)}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value || 0) })}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editing.description ?? ''}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    />
                  </div>

                  {/* Features editor */}
                  <div className="col-md-12">
                    <label className="form-label">Features</label>
                    <FeatureEditor
                      features={editing.features ?? []}
                      onAdd={(t) => onFeatureAdd(t)}
                      onRemove={(i) => onFeatureRemove(i)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={upsertPlan}>
                  {editing.id ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Feature Editor subcomponent ---------------------------------------
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
          className="btn btn-outline-primary"
          type="button"
          onClick={() => {
            onAdd(value);
            setValue('');
          }}
        >
          Add
        </button>
      </div>

      {features.length > 0 ? (
        <ul className="list-group">
          {features.map((f, i) => (
            <li key={`${f}-${i}`} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{f}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onRemove(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted small">No features added yet.</div>
      )}
    </div>
  );
}
