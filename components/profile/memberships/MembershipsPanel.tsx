'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFrown } from 'react-icons/fi';
import MembershipCard, { type UIMembershipPlan } from './MembershipCard';

type Props = {
  userId: string;
  currentPlanId: string | null;
  apiBase?: string;
  onPlanChanged?: (newPlanId: string | null) => void;
};

type BackendPlan = {
  id: string;
  name: string;
  price: number;       // monthly price
  description: string;
  features: string[];  // array of strings
};

const formatPrice = (n: number) =>
  n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
  if (lower.includes('pro'))   return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free'))  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro'))   return 'Most Popular';
  return undefined;
};

export default function MembershipsPanel({
  userId,
  currentPlanId,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  onPlanChanged,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [plans, setPlans] = useState<UIMembershipPlan[]>([]);
  const [selected, setSelected] = useState<string | null>(currentPlanId ?? null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setSelected(currentPlanId ?? null), [currentPlanId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${base}/api/memberships/`, { method: 'GET' });
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: BackendPlan[] = await res.json();

        const ui: UIMembershipPlan[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: formatPrice(p.price),
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          gradient: gradientFor(p.name),
          badge: badgeFor(p.name) ?? null,
        }));

        // Ensure there's a visible Free option
        const hasFree = ui.some((p) => p.name.toLowerCase() === 'free' || p.id === null);
        const withFree = hasFree
          ? ui
          : [
              {
                id: null,
                name: 'Free',
                price: '$0',
                description: 'Get started with the basics.',
                features: ['Basic logs', 'Workout plan viewer'],
                gradient: gradientFor('free'),
                badge: null,
              },
              ...ui,
            ];

        if (!cancelled) setPlans(withFree);
      } catch {
        if (!cancelled) {
          // Minimal fallback if the API is down
          setPlans([
            {
              id: null,
              name: 'Free',
              price: '$0',
              description: 'Get started with the basics.',
              features: ['Basic logs', 'Workout plan viewer'],
              gradient: gradientFor('free'),
              badge: null,
            },
            {
              id: 'pro_2025',
              name: 'Pro',
              price: '$9/mo',
              description: 'Weekly plan + AI + analytics.',
              features: ['Workout library', 'AI generator', 'Analytics'],
              gradient: gradientFor('pro'),
              badge: 'Most Popular',
            },
            {
              id: 'elite_2025',
              name: 'Elite',
              price: '$19/mo',
              description: 'Everything in Pro plus 1:1 feedback.',
              features: ['Priority support', 'Form feedback'],
              gradient: gradientFor('elite'),
              badge: 'Best Value',
            },
          ]);
          setErr('Using fallback plans (API unavailable).');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [base]);

  useEffect(() => {
    if (!msg && !err) return;
    const t = setTimeout(() => {
      setMsg(null);
      setErr(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [msg, err]);

  async function changePlan(planId: string | null) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setErr('No token found.');
      return;
    }

    setSaving(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ membership_plan_id: planId }),
      });

      const maybe = await res.json().catch(() => null);
      if (!res.ok) {
        const m = (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

      setSelected(planId);
      setMsg('Membership updated!');
      onPlanChanged?.(planId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-3"
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <FiFrown /> Memberships
        </h5>
        <div className="text-muted small">Choose the plan that fits your training.</div>
      </div>

      {/* alerts */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="bio-alert bio-alert--success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {msg}
          </motion.div>
        )}
        {err && (
          <motion.div
            className="bio-alert bio-alert--error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-muted small">Loading plans…</div>
      ) : (
        <div className="row g-3">
          {plans.map((plan) => {
            const isCurrent = selected === plan.id;
            return (
              <div className="col-md-4" key={`${plan.id ?? 'free'}`}>
                <MembershipCard
                  plan={plan}
                  isCurrent={isCurrent}
                  saving={saving}
                  onSelect={() => changePlan(plan.id)}  // confirm inside the modal triggers this
                />
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}


/*

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiFrown, FiZap, FiShield } from 'react-icons/fi';

type Props = {
  userId: string;
  currentPlanId: string | null;
  apiBase?: string;
  onPlanChanged?: (newPlanId: string | null) => void;
};

type Plan = {
  id: string | null;
  name: string;
  price: string;
  badge?: string;
  gradient: string;
  features: { label: string; included: boolean }[];
};

const PLANS: Plan[] = [
  {
    id: null,
    name: 'Free',
    price: '$0',
    gradient: 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))',
    features: [
      { label: 'Basic logs', included: true },
      { label: 'Workout plan viewer', included: true },
      { label: 'AI generator', included: false },
      { label: 'Advanced analytics', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro_2025',
    name: 'Pro',
    price: '$9/mo',
    badge: 'Most Popular',
    gradient: 'linear-gradient(135deg, #7E8EF1, #5BD1D7)',
    features: [
      { label: 'Basic logs', included: true },
      { label: 'Workout plan viewer', included: true },
      { label: 'AI generator', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'elite_2025',
    name: 'Elite',
    price: '$19/mo',
    badge: 'Best Value',
    gradient: 'linear-gradient(135deg, #FF9770, #FFD670)',
    features: [
      { label: 'Basic logs', included: true },
      { label: 'Workout plan viewer', included: true },
      { label: 'AI generator', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Priority support', included: true },
    ],
  },
];

export default function MembershipsPanel({
  userId,
  currentPlanId,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  onPlanChanged,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [selected, setSelected] = useState<string | null>(currentPlanId);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setSelected(currentPlanId), [currentPlanId]);

  useEffect(() => {
    if (!msg && !err) return;
    const t = setTimeout(() => {
      setMsg(null);
      setErr(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [msg, err]);

  async function changePlan(planId: string | null) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setErr('No token found.');
      return;
    }

    setSaving(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ membership_plan_id: planId }),
      });

      const maybe = await res.json().catch(() => null);
      if (!res.ok) {
        const m = (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

      setSelected(planId);
      setMsg('Membership updated!');
      onPlanChanged?.(planId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-3"
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <FiFrown /> Memberships
        </h5>
        <div className="text-muted small">Choose the plan that fits your training.</div>
      </div>

      
      <AnimatePresence>
        {msg && (
          <motion.div
            className="bio-alert bio-alert--success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {msg}
          </motion.div>
        )}
        {err && (
          <motion.div
            className="bio-alert bio-alert--error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="row g-3">
        {PLANS.map((plan) => {
          const isCurrent = selected === plan.id;
          return (
            <div className="col-md-4" key={plan.name}>
              <motion.div
                whileHover={{ y: -3 }}
                className="card h-100 shadow-sm"
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,.06)',
                }}
              >
                <div
                  style={{
                    background: plan.gradient,
                    padding: '14px 16px',
                    color: '#222',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-semibold">{plan.name}</div>
                    {plan.badge && (
                      <span className="badge bg-light text-dark border">{plan.badge}</span>
                    )}
                  </div>
                  <div className="fs-5 mt-1">{plan.price}</div>
                </div>

                <div className="card-body">
                  <ul className="list-unstyled small m-0">
                    {plan.features.map((f) => (
                      <li key={f.label} className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className="d-inline-flex align-items-center justify-content-center"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: f.included ? 'rgba(126,142,241,.18)' : 'rgba(0,0,0,.05)',
                            color: f.included ? '#6b7cff' : '#999',
                          }}
                        >
                          {f.included ? <FiCheck /> : <FiShield />}
                        </span>
                        <span className={f.included ? '' : 'text-muted'}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer bg-white border-0 pb-3">
                  <button
                    className={`btn btn-sm ${isCurrent ? 'btn-outline-secondary' : 'btn-primary'}`}
                    onClick={() => changePlan(plan.id)}
                    disabled={saving || isCurrent}
                    style={{ borderRadius: 10 }}
                  >
                    {isCurrent ? 'Current plan' : plan.id ? 'Upgrade' : 'Switch to Free'}
                    {!isCurrent && <FiZap style={{ marginLeft: 6, marginTop: -2 }} />}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

*/