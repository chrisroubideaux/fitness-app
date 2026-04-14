// components/profile/memberships/MembershipsPanel.tsx
// components/profile/memberships/MembershipsPanel.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiGrid, FiInfo, FiArrowRight, FiCreditCard } from 'react-icons/fi';
import Tabs from '@/components/payment/Tab';
import StripeMembershipCard, {
  type UIMembershipPlan,
} from '@/components/payment/StripeMembershipCard';
import ManageSubscriptionCard from '@/components/payment/ManageSubscriptionCard';
import SubscriptionDetails from '@/components/payment/SubscriptionDetails';

type TabKey = 'plans' | 'manage' | 'details';
type TabItem = { key: TabKey; label: string; icon: React.ReactNode };

type Props = {
  currentPlanId: string | null;
  apiBase?: string;
  onPlanChanged?: (newPlanId: string | null) => void;
};

type BackendPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripe_price_id?: string | null;
};

const formatPrice = (n: number) =>
  n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
  if (lower.includes('pro')) return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free')) {
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  }
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro')) return 'Most Popular';
  return undefined;
};

export default function MembershipsPanel({
  currentPlanId,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [plans, setPlans] = useState<UIMembershipPlan[]>([]);
  const [selected, setSelected] = useState<string | null>(currentPlanId ?? null);
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('plans');

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
          id: p.name.toLowerCase() === 'free' ? null : p.id,
          name: p.name,
          price: formatPrice(p.price),
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          gradient: gradientFor(p.name),
          badge: badgeFor(p.name) ?? null,
          stripe_price_id: p.stripe_price_id ?? null,
        }));

        if (!cancelled) setPlans(ui);
      } catch {
        if (!cancelled) {
          setPlans([
            {
              id: null,
              name: 'Free',
              price: '$0',
              description: 'Get started with the basics.',
              features: ['Basic logs', 'Workout plan viewer'],
              gradient: gradientFor('free'),
              badge: null,
              stripe_price_id: null,
            },
            {
              id: 'pro_2025',
              name: 'Pro',
              price: '$9/mo',
              description: 'Weekly plan + AI + analytics.',
              features: ['Workout library', 'AI generator', 'Analytics'],
              gradient: gradientFor('pro'),
              badge: 'Most Popular',
              stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
            },
            {
              id: 'elite_2025',
              name: 'Elite',
              price: '$19/mo',
              description: 'Everything in Pro plus 1:1 feedback.',
              features: ['Priority support', 'Form feedback'],
              gradient: gradientFor('elite'),
              badge: 'Best Value',
              stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE ?? null,
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

  const successPath = '/billing/success';
  const cancelPath = '/profile';

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
        <div
          className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-start"
          style={{ gap: '1rem', marginBottom: '1.25rem' }}
        >
          <div>
            <span
              style={{
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
              }}
            >
              <FiCreditCard />
              Memberships
            </span>

            <h2
              style={{
                margin: 0,
                color: '#111827',
                fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
                fontWeight: 950,
                letterSpacing: '-0.04em',
              }}
            >
              Plans and subscription
            </h2>

            <p
              style={{
                margin: '0.55rem 0 0',
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              Choose a plan, manage billing, or review your current subscription
              details from one place.
            </p>
          </div>

          <div
            style={{
              maxWidth: '100%',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            <Tabs
              active={activeTab}
              onChange={(key: string) => setActiveTab(key as TabKey)}
              tabs={[
                { key: 'plans', label: 'Plans', icon: <FiGrid /> } as TabItem,
                { key: 'manage', label: 'Manage', icon: <FiSettings /> } as TabItem,
                { key: 'details', label: 'Details', icon: <FiInfo /> } as TabItem,
              ]}
            />
          </div>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: '1rem',
                padding: '0.9rem 1rem',
                borderRadius: 20,
                background: 'rgba(34,197,94,0.10)',
                border: '1px solid rgba(34,197,94,0.16)',
                color: '#15803d',
                fontWeight: 800,
              }}
            >
              {msg}
            </motion.div>
          )}

          {err && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: '1rem',
                padding: '0.9rem 1rem',
                borderRadius: 20,
                background: 'rgba(245,158,11,0.10)',
                border: '1px solid rgba(245,158,11,0.16)',
                color: '#92400e',
                fontWeight: 800,
              }}
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'plans' ? (
          loading ? (
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
          ) : (
            <>
              <div className="row g-4">
                {plans.map((plan) => {
                  const isCurrent = selected === plan.id;

                  return (
                    <div
                      className="col-12 col-md-6 col-xl-4"
                      key={`${plan.id ?? 'free'}`}
                    >
                      <StripeMembershipCard
                        plan={plan}
                        isCurrent={isCurrent}
                        saving={saving}
                        apiBase={base}
                        successPath={successPath}
                        cancelPath={cancelPath}
                        onBeforeRedirect={() => {
                          try {
                            localStorage.setItem('checkoutIntent', '1');
                            localStorage.setItem(
                              'preselectedPlanId',
                              plan.id ?? 'free'
                            );
                          } catch {}
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                className="d-flex justify-content-end"
                style={{ marginTop: '1.25rem' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  style={{
                    minHeight: 44,
                    padding: '0.8rem 1rem',
                    borderRadius: 15,
                    border: '1px solid rgba(139,92,246,0.14)',
                    background: '#ffffff',
                    color: '#7c3aed',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
                  }}
                >
                  Manage subscription
                  <FiArrowRight />
                </button>
              </div>
            </>
          )
        ) : activeTab === 'manage' ? (
          <motion.div
            id="panel-manage"
            role="tabpanel"
            aria-labelledby="tab-manage"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              borderRadius: 30,
              padding: 'clamp(1rem, 3vw, 1.25rem)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          >
            <ManageSubscriptionCard
              apiBase={base}
              onBackToPlans={() => setActiveTab('plans')}
            />
          </motion.div>
        ) : (
          <motion.div
            id="panel-details"
            role="tabpanel"
            aria-labelledby="tab-details"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              borderRadius: 30,
              padding: 'clamp(1rem, 3vw, 1.25rem)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          >
            <SubscriptionDetails apiBase={base} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}


{/*
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  FiSettings, FiGrid, FiInfo } from "react-icons/fi";
import Tabs from "@/components/payment/Tab";
import StripeMembershipCard, { type UIMembershipPlan } from "@/components/payment/StripeMembershipCard";
import ManageSubscriptionCard from "@/components/payment/ManageSubscriptionCard";
import SubscriptionDetails from "@/components/payment/SubscriptionDetails"; 

type TabKey = "plans" | "manage" | "details";
type TabItem = { key: TabKey; label: string; icon: React.ReactNode };

type Props = {
  currentPlanId: string | null;
  apiBase?: string;
  onPlanChanged?: (newPlanId: string | null) => void;
};

type BackendPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripe_price_id?: string | null;
};

const formatPrice = (n: number) => (n === 0 ? "$0" : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`);
const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("elite")) return "linear-gradient(135deg, #FF9770, #FFD670)";
  if (lower.includes("pro")) return "linear-gradient(135deg, #7E8EF1, #5BD1D7)";
  if (lower.includes("free")) return "linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))";
  return "linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))";
};
const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("elite")) return "Best Value";
  if (lower.includes("pro")) return "Most Popular";
  return undefined;
};

export default function MembershipsPanel({
  currentPlanId,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);

  const [plans, setPlans] = useState<UIMembershipPlan[]>([]);
  const [selected, setSelected] = useState<string | null>(currentPlanId ?? null);
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("plans");

  useEffect(() => setSelected(currentPlanId ?? null), [currentPlanId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${base}/api/memberships/`, { method: "GET" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: BackendPlan[] = await res.json();

        const ui: UIMembershipPlan[] = data.map((p) => ({
          id: p.name.toLowerCase() === "free" ? null : p.id,
          name: p.name,
          price: formatPrice(p.price),
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          gradient: gradientFor(p.name),
          badge: badgeFor(p.name) ?? null,
          stripe_price_id: p.stripe_price_id ?? null,
        }));

        if (!cancelled) setPlans(ui);
      } catch {
        if (!cancelled) {
          setPlans([
            {
              id: null,
              name: "Free",
              price: "$0",
              description: "Get started with the basics.",
              features: ["Basic logs", "Workout plan viewer"],
              gradient: gradientFor("free"),
              badge: null,
              stripe_price_id: null,
            },
            {
              id: "pro_2025",
              name: "Pro",
              price: "$9/mo",
              description: "Weekly plan + AI + analytics.",
              features: ["Workout library", "AI generator", "Analytics"],
              gradient: gradientFor("pro"),
              badge: "Most Popular",
              stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
            },
            {
              id: "elite_2025",
              name: "Elite",
              price: "$19/mo",
              description: "Everything in Pro plus 1:1 feedback.",
              features: ["Priority support", "Form feedback"],
              gradient: gradientFor("elite"),
              badge: "Best Value",
              stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE ?? null,
            },
          ]);
          setErr("Using fallback plans (API unavailable).");
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

  // Send users to handler page (fixes /profile 404 when no id)
  const successPath = "/billing/success";
  const cancelPath = "/profile";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-3">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h5 className="mb-0 d-flex align-items-center gap-2 fw-bold">
             Memberships
        </h5>
        <div className="text-muted small">Choose a plan or manage your subscription.</div>
        <Tabs
          active={activeTab}
          onChange={(key: string) => setActiveTab(key as TabKey)}
          tabs={[
            { key: "plans", label: "Plans", icon: <FiGrid /> } as TabItem,
            { key: "manage", label: "Manage", icon: <FiSettings /> } as TabItem,
            { key: "details", label: "Details", icon: <FiInfo /> } as TabItem, // ✅ new
          ]}
        />
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div className="bio-alert bio-alert--success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {msg}
          </motion.div>
        )}
        {err && (
          <motion.div className="bio-alert bio-alert--error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "plans" ? (
        loading ? (
          <div className="text-muted small">Loading plans…</div>
        ) : (
          <>
            <div className="row g-3">
              {plans.map((plan) => {
                const isCurrent = selected === plan.id;
                return (
                  <div className="col-12 col-sm-6 col-lg-4" key={`${plan.id ?? "free"}`}>
                    <StripeMembershipCard
                      plan={plan}
                      isCurrent={isCurrent}
                      saving={saving}
                      apiBase={base}
                      successPath={successPath}
                      cancelPath={cancelPath}
                      onBeforeRedirect={() => {
                        try {
                          localStorage.setItem("checkoutIntent", "1");
                          localStorage.setItem("preselectedPlanId", plan.id ?? "free");
                        } catch {}
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setActiveTab("manage")}>
                Manage subscription →
              </button>
            </div>
          </>
        )
      ) : activeTab === "manage" ? (
        <div id="panel-manage" role="tabpanel" aria-labelledby="tab-manage">
          <ManageSubscriptionCard apiBase={base} onBackToPlans={() => setActiveTab("plans")} />
        </div>
      ) : (
        <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">
          <SubscriptionDetails apiBase={base} />
        </div>
      )}
    </motion.div>
  );
}

*/}