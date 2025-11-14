// AdminMembershipsTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
} from '@/store/slices/membershipsSlice';

export default function AdminMembershipsTest() {
  const dispatch = useAppDispatch();
  const { list: plans, loading, error } = useAppSelector((s) => s.memberships);

  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    features: '',
  });

  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  // Load existing plans
  useEffect(() => {
    dispatch(fetchMemberships());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ id: '', name: '', price: '', description: '', features: '' });
    setMode('create');
  };

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
  };

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
    <div className="card p-4 shadow-sm mt-4">
      <h4 className="mb-3">🧪 Admin Memberships CRUD Test</h4>

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

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Elite, Pro, Basic"
              required
            />
          </div>

          <div className="col-md-4">
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

          <div className="col-md-4">
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

      {loading && <p>Loading plans…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && plans.length > 0 && (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td className="small text-muted">{p.description}</td>
                  <td className="small">
                    {p.features.slice(0, 3).join(', ')}
                    {p.features.length > 3 && '…'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(p.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
