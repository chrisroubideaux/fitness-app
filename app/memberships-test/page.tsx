// app/memberships-test
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
} from '@/store/slices/membershipsSlice';

export default function MembershipsTestPage() {
  const dispatch = useAppDispatch();
  const { list: plans, loading, error } = useAppSelector((state) => state.memberships);

  // 🧩 Admin form state
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    features: '',
  });
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 Fetch membership plans on mount
  useEffect(() => {
    dispatch(fetchMemberships());
  }, [dispatch]);

  const formatPrice = (n: number) =>
    n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

  const gradientFor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
    if (lower.includes('pro')) return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
    if (lower.includes('custom')) return 'linear-gradient(135deg, #D16BA5, #86A8E7)';
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  };

  const badgeFor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('elite')) return 'Best Value';
    if (lower.includes('pro')) return 'Most Popular';
    if (lower.includes('custom')) return '1:1 Coaching';
    return undefined;
  };

  // 🧩 Reset form
  const resetForm = () => {
    setForm({ id: '', name: '', price: '', description: '', features: '' });
    setMode('create');
  };

  // 🧩 Handle submit (create / update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setMessage('⚠️ Name and price are required.');
      return;
    }

    try {
      if (mode === 'create') {
        await dispatch(
          createMembership({
            name: form.name,
            price: parseFloat(form.price),
            description: form.description,
            features: form.features.split(',').map((f) => f.trim()),
          })
        ).unwrap();
        setMessage('✅ Created new plan!');
      } else if (mode === 'edit' && form.id) {
        await dispatch(
          updateMembership({
            id: form.id,
            payload: {
              name: form.name,
              price: parseFloat(form.price),
              description: form.description,
              features: form.features.split(',').map((f) => f.trim()),
            },
          })
        ).unwrap();
        setMessage('✅ Updated plan!');
      }
      resetForm();
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Operation failed'}`);
    }
  };

  // 🧩 Handle edit click (inline)
  const handleEdit = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      features: (plan.features || []).join(', '),
    });
    setMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🧩 Delete plan
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await dispatch(deleteMembership(id)).unwrap();
      setMessage('🗑️ Deleted successfully.');
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Delete failed'}`);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">🧭 Memberships Redux Test</h2>

      {/* ✅ ADMIN CRUD PANEL */}
      <div className="card p-4 shadow-sm mb-5">
        <h4 className="mb-3">⚙️ Admin Membership CRUD</h4>

        {message && (
          <div
            className={`alert ${
              message.startsWith('✅')
                ? 'alert-success'
                : message.startsWith('🗑️')
                ? 'alert-warning'
                : 'alert-danger'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Elite, Pro, Basic"
                required
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Price</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="29.99"
                required
              />
            </div>

            <div className="col-md-7">
              <label className="form-label fw-semibold">Features (comma-separated)</label>
              <input
                className="form-control"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Feature A, Feature B, Feature C"
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              {mode === 'create' ? 'Create Plan' : 'Update Plan'}
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ✅ USER-FACING DISPLAY */}
      {loading && <p>Loading plans…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && plans.length > 0 && (
        <div className="row g-4">
          {plans.map((plan) => (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <div
                className="card text-white shadow-lg border-0 h-100"
                style={{
                  background: gradientFor(plan.name),
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => handleEdit(plan.id)} // 🔹 click plan to edit
                title="Click to edit this plan"
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h4 className="fw-bold mb-2">{plan.name}</h4>
                    {badgeFor(plan.name) && (
                      <span className="badge bg-dark mb-2">{badgeFor(plan.name)}</span>
                    )}
                    <h5 className="fw-semibold">{formatPrice(plan.price)}</h5>
                    <p className="small mt-2">{plan.description}</p>
                  </div>

                  <ul className="list-unstyled mt-3 mb-0 small">
                    {plan.features?.slice(0, 5).map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                    {plan.features?.length > 5 && (
                      <li className="text-muted">+{plan.features.length - 5} more…</li>
                    )}
                  </ul>

                  <button
                    className="btn btn-sm btn-outline-light mt-3 align-self-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(plan.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !plans.length && !error && (
        <p className="text-muted">No plans available.</p>
      )}
    </div>
  );
}




{/*
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMemberships } from '@/store/slices/membershipsSlice';

export default function MembershipsTestPage() {
  const dispatch = useAppDispatch();
  const { list: plans, loading, error } = useAppSelector((state) => state.memberships);

  // 🔹 Fetch membership plans on mount
  useEffect(() => {
    dispatch(fetchMemberships());
  }, [dispatch]);

  const formatPrice = (n: number) =>
    n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

  const gradientFor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
    if (lower.includes('pro')) return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
    if (lower.includes('custom')) return 'linear-gradient(135deg, #D16BA5, #86A8E7)';
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  };

  const badgeFor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('elite')) return 'Best Value';
    if (lower.includes('pro')) return 'Most Popular';
    if (lower.includes('custom')) return '1:1 Coaching';
    return undefined;
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">🧭 Memberships Redux Test</h2>

      {loading && <p>Loading plans…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && plans.length > 0 && (
        <div className="row g-4">
          {plans.map((plan) => (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <div
                className="card text-white shadow-lg border-0 h-100"
                style={{
                  background: gradientFor(plan.name),
                  borderRadius: '16px',
                }}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h4 className="fw-bold mb-2">{plan.name}</h4>
                    {badgeFor(plan.name) && (
                      <span className="badge bg-dark mb-2">{badgeFor(plan.name)}</span>
                    )}
                    <h5 className="fw-semibold">{formatPrice(plan.price)}</h5>
                    <p className="small mt-2">{plan.description}</p>
                  </div>

                  <ul className="list-unstyled mt-3 mb-0 small">
                    {plan.features?.slice(0, 5).map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                    {plan.features?.length > 5 && (
                      <li className="text-muted">+{plan.features.length - 5} more…</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !plans.length && !error && (
        <p className="text-muted">No plans available.</p>
      )}
    </div>
  );
}

*/}
