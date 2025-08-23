// components/profile/memberships/MembershipsPanel.tsx
// components/profile/memberships/MembershipsPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFrown, FiSettings, FiGrid } from "react-icons/fi";
import Tabs from "@/components/payment/Tab";
import StripeMembershipCard, {
  type UIMembershipPlan,
} from "@/components/payment/StripeMembershipCard";
import ManageSubscriptionCard from "@/components/payment/ManageSubscriptionCard";

type TabItem = {
  key: "plans" | "manage";
  label: string;
  icon: React.ReactNode;
};

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
  n === 0 ? "$0" : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("elite")) return "linear-gradient(135deg, #FF9770, #FFD670)";
  if (lower.includes("pro")) return "linear-gradient(135deg, #7E8EF1, #5BD1D7)";
  if (lower.includes("free"))
    return "linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))";
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

  const [activeTab, setActiveTab] = useState<"plans" | "manage">("plans");

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
              stripe_price_id:
                process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
            },
            {
              id: "elite_2025",
              name: "Elite",
              price: "$19/mo",
              description: "Everything in Pro plus 1:1 feedback.",
              features: ["Priority support", "Form feedback"],
              gradient: gradientFor("elite"),
              badge: "Best Value",
              stripe_price_id:
                process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE ?? null,
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

  const successPath = "/profile";
  const cancelPath = "/profile";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-3"
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <FiFrown /> Memberships
        </h5>
        <div className="text-muted small">Choose a plan or manage your subscription.</div>
        <Tabs
          active={activeTab}
          onChange={(key: string) => setActiveTab(key as "plans" | "manage")}
          tabs={[
            { key: "plans", label: "Plans", icon: <FiGrid /> } as TabItem,
            { key: "manage", label: "Manage", icon: <FiSettings /> } as TabItem,
          ]}
        />
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

      {activeTab === "plans" ? (
        loading ? (
          <div className="text-muted small">Loading plans…</div>
        ) : (
          <>
            <div className="row g-3">
              {plans.map((plan) => {
                const isCurrent = selected === plan.id;
                return (
                  <div
                    className="col-12 col-sm-6 col-lg-4"
                    key={`${plan.id ?? "free"}`}
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
                          localStorage.setItem("checkoutIntent", "1");
                        } catch {}
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setActiveTab("manage")}
              >
                Manage subscription →
              </button>
            </div>
          </>
        )
      ) : (
        <div id="panel-manage" role="tabpanel" aria-labelledby="tab-manage">
          <ManageSubscriptionCard
            apiBase={base}
            onBackToPlans={() => setActiveTab("plans")}
          />
        </div>
      )}
    </motion.div>
  );
}



/*
// components/profile/memberships/MembershipsPanel.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFrown } from 'react-icons/fi';
import StripeMembershipCard, {
  type UIMembershipPlan,
} from '@/components/payment/StripeMembershipCard';

type Props = {
  currentPlanId: string | null;
  apiBase?: string;
  onPlanChanged?: (newPlanId: string | null) => void; // keep declared, but optional
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
  if (lower.includes('free'))
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
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
              stripe_price_id:
                process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
            },
            {
              id: 'elite_2025',
              name: 'Elite',
              price: '$19/mo',
              description: 'Everything in Pro plus 1:1 feedback.',
              features: ['Priority support', 'Form feedback'],
              gradient: gradientFor('elite'),
              badge: 'Best Value',
              stripe_price_id:
                process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE ?? null,
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

  const successPath = '/profile';
  const cancelPath = '/profile';

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
        <div className="text-muted small">
          Choose the plan that fits your training.
        </div>
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

      {loading ? (
        <div className="text-muted small">Loading plans…</div>
      ) : (
        <div className="row g-3">
          {plans.map((plan) => {
            const isCurrent = selected === plan.id;
            return (
              <div
                className="col-12 col-sm-6 col-lg-4"
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
                    } catch {}
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}






*/