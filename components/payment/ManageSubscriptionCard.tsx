// components/payment/ManageSubscriptionCard.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSync, FaCreditCard, FaCalendarTimes, FaTimesCircle, FaArrowLeft } from "react-icons/fa";

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
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [me, setMe] = useState<Me | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | "free">("free");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refreshMe() {
    try {
      const res = await fetch(`${base}/api/users/me`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to refresh user.");
      setMe(j);
    } catch (e) {
      console.debug("[refreshMe] failed", e);
    }
  }

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
        setErr(e instanceof Error ? e.message : "Could not load subscription data.");
      }
    })();
  }, [base, token]);

  useEffect(() => {
    if (!msg && !err) return;
    const t = setTimeout(() => {
      setMsg(null);
      setErr(null);
    }, 2400);
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
      setErr(e instanceof Error ? e.message : "Unable to open billing portal.");
    } finally {
      setBusy(false);
    }
  }

  async function changePlan() {
    setErr(null);
    setMsg(null);
    if (!me) return;

    if (selectedPlanId === "free") {
      // Treat "free" as cancel-at-period-end by default; backend may be idempotent.
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
      if (!res.ok) throw new Error(json?.message || json?.error || "Change plan failed.");

      // If backend created a Checkout Session (no active Stripe sub), redirect there
      if (json?.url) {
        window.location.href = json.url;
        return;
      }

      if (json?.noop) {
        setMsg("Already on that plan.");
      } else {
        setMsg("Plan updated! It may take a moment to reflect.");
      }
      await refreshMe();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unable to change plan.");
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
        body: JSON.stringify({ at_period_end: atPeriodEnd }), // matches backend
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || json?.error || "Cancel failed.");
      }

      if (json?.noop) {
        setMsg("Nothing to cancel — you’re already on Free.");
      } else if (json?.reconciled) {
        setMsg("Subscription not found on Stripe; your account was reset to Free.");
      } else {
        setMsg(atPeriodEnd ? "Cancellation scheduled at period end." : "Subscription cancelled immediately.");
      }

      // Optimistic UI on immediate cancel / reconciled / noop
      if (!atPeriodEnd || json?.reconciled || json?.noop) {
        setMe((m) => (m ? { ...m, stripe_subscription_id: null, membership_plan_id: null } : m));
      }

      await refreshMe();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unable to cancel subscription.");
    } finally {
      setBusy(false);
    }
  }

  const hasActiveSub = !!me?.stripe_subscription_id;

  return (
    <div className="subscription-card shadow-lg" style={{ borderRadius: 16, maxWidth: 680 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="mb-1">Manage Subscription</h5>
            <p className="text-muted mb-3">
              Current plan: <strong>{currentPlanName}</strong>
            </p>
          </div>
          {onBackToPlans && (
            <button type="button" className="btn btn-sm btn-link text-white" onClick={onBackToPlans}>
              <FaArrowLeft className="me-1" /> Back to plans
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
              onChange={(e) => setSelectedPlanId((e.target.value || "free") as string | "free")}
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
              className="btn btn-sm btn-outline-light text-white"
              onClick={changePlan}
              disabled={busy}
            >
              <FaSync className="me-1" />
              {busy ? "Working…" : "Update Plan"}
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-light text-white"
              onClick={openBillingPortal}
              disabled={busy}
              title={hasActiveSub ? "Manage payment method & invoices" : "No active subscription"}
            >
              <FaCreditCard className="me-1" /> Manage Billing
            </button>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-wrap gap-2">
          {/* Always clickable; white text */}
          <button
            type="button"
            className="btn btn-sm border border-white text-white bg-transparent"
            onClick={() => cancelSubscription(true)}
            disabled={busy}
            title="Cancel when current period ends"
          >
            <FaCalendarTimes className="me-1" /> Cancel at Period End
          </button>

          <button
            type="button"
            className="btn btn-sm border border-white text-white bg-transparent"
            onClick={() => cancelSubscription(false)}
            disabled={busy}
            title="Cancel immediately"
          >
            <FaTimesCircle className="me-1" /> Cancel Immediately
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
