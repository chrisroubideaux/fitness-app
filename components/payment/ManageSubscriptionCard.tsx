// components/billing/ManageSubscriptionCard.tsx
// components/payment/ManageSubscriptionCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Me = {
  id: string;
  email: string;
  full_name?: string | null;
  membership_plan_id: string | null;
  stripe_subscription_id?: string | null;
};

type Plan = { id: string; name: string; stripe_price_id?: string | null };

export default function ManageSubscriptionCard({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  onBackToPlans,
}: {
  apiBase?: string;
  onBackToPlans?: () => void;
}) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [me, setMe] = useState<Me | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | "free">("free");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, plansRes] = await Promise.all([
          fetch(`${base}/api/users/me`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
          fetch(`${base}/api/memberships/`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
        ]);

        const meJson = await meRes.json();
        const rawPlans = await plansRes.json();

        if (!meRes.ok) throw new Error(meJson?.error || "Failed to load user.");
        if (!plansRes.ok) throw new Error("Failed to load plans.");

        const normalizedPlans: Plan[] = Array.isArray(rawPlans)
          ? rawPlans
          : Array.isArray(rawPlans.items)
          ? rawPlans.items
          : Array.isArray(rawPlans.data)
          ? rawPlans.data
          : [];

        setMe(meJson);
        setPlans(normalizedPlans);
        setSelectedPlanId(meJson?.membership_plan_id ?? "free");
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message || "Could not load subscription data.");
        } else {
          setErr("Could not load subscription data.");
        }
      }
    })();
  }, [base, token]);

  useEffect(() => {
    if (!msg && !err) return;
    const t = setTimeout(() => {
      setMsg(null);
      setErr(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [msg, err]);

  const currentPlanName =
    (me?.membership_plan_id &&
      plans.find((p) => p.id === me.membership_plan_id)?.name) ||
    "Free";

  async function openBillingPortal() {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`${base}/api/payments/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Portal error.");
      if (json?.url) {
        window.location.href = json.url;
        return;
      }
      throw new Error("No billing portal URL returned.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message || "Unable to open billing portal.");
      } else {
        setErr("Unable to open billing portal.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function changePlan() {
    setErr(null);
    setMsg(null);
    if (!me) return;

    if (selectedPlanId === "free") {
      return cancelSubscription(true);
    }

    setBusy(true);
    try {
      const res = await fetch(`${base}/api/payments/change-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Change plan failed.");

      setMsg("Plan updated! It may take a moment to reflect.");
      setMe((m) => (m ? { ...m, membership_plan_id: selectedPlanId as string } : m));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message || "Unable to change plan.");
      } else {
        setErr("Unable to change plan.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancelSubscription(atPeriodEnd = true) {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`${base}/api/payments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ at_period_end: atPeriodEnd }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Cancel failed.");

      setMsg("Subscription cancelled! It may take a moment to reflect.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message || "Unable to cancel subscription.");
      } else {
        setErr("Unable to cancel subscription.");
      }
    } finally {
      setBusy(false);
    }
  }

  const hasActiveSub = !!me?.stripe_subscription_id;

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16, maxWidth: 680 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="mb-1">Manage Subscription</h5>
            <p className="text-muted mb-3">
              Current plan: <strong>{currentPlanName}</strong>
            </p>
          </div>
          {onBackToPlans && (
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={onBackToPlans}
            >
              ← Back to plans
            </button>
          )}
        </div>

        {err && <div className="alert alert-danger py-2">{err}</div>}
        {msg && <div className="alert alert-success py-2">{msg}</div>}

        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Change plan</label>
            <select
              className="form-select"
              value={selectedPlanId}
              onChange={(e) =>
                setSelectedPlanId((e.target.value || "free") as string | "free")
              }
              disabled={busy}
            >
              <option value="free">Free</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={changePlan}
              disabled={busy}
            >
              {busy ? "Working…" : "Update Plan"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={openBillingPortal}
              disabled={busy || !hasActiveSub}
              title={
                hasActiveSub
                  ? "Manage payment method & invoices"
                  : "No active subscription"
              }
            >
              Manage Billing
            </button>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => cancelSubscription(true)}
            disabled={busy || !hasActiveSub}
            title={hasActiveSub ? "" : "No active subscription"}
          >
            Cancel at Period End
          </button>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => cancelSubscription(false)}
            disabled={busy || !hasActiveSub}
            title={hasActiveSub ? "" : "No active subscription"}
          >
            Cancel Immediately
          </button>
        </div>

        {!hasActiveSub && (
          <p className="text-muted small mt-2">
            You don’t have an active subscription. Pick a paid plan above to start one.
          </p>
        )}
      </div>
    </div>
  );
}
