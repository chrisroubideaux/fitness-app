// components/profile/payment/SubscriptionDetails.tsx
// components/profile/payment/SubscriptionDetails.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiInfo, FiCalendar, FiDollarSign, FiSettings } from "react-icons/fi";

type Summary = {
  has_subscription: boolean;
  plan: { id: string | null; name: string | null };
  next_bill: {
    amount: number | null;
    currency: string | null;
    date_unix: number | null;
    date_iso: string | null;
  } | null;
  status?: string | null;
  cancel_at_period_end?: boolean;
};

type Me = {
  id: string;
  email: string;
  full_name?: string | null;
  membership_plan_id: string | null;
  plan_name?: string | null;     // from /me
  plan_price?: number | null;    // from /me (USD)
  plan_features?: string[];      // from /me
};

export default function SubscriptionDetails({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: {
  apiBase?: string;
}) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const [sumRes, meRes] = await Promise.all([
        fetch(`${base}/api/payments/summary`, { headers }),
        fetch(`${base}/api/users/me`, { headers }),
      ]);

      const [sumJson, meJson] = await Promise.all([
        sumRes.json().catch(() => null),
        meRes.json().catch(() => null),
      ]);

      if (!sumRes.ok && !meRes.ok) {
        const m =
          sumJson?.message ||
          sumJson?.error ||
          meJson?.message ||
          meJson?.error ||
          `Summary ${sumRes.status} / Me ${meRes.status}`;
        throw new Error(m);
      }

      if (sumRes.ok) setSummary(sumJson as Summary);
      if (meRes.ok) setMe(meJson as Me);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- display helpers ---------
  function resolvedPlanName(s: Summary | null, m: Me | null) {
    const fromMe = m?.plan_name?.trim();
    if (fromMe) return fromMe; // ✅ prefer /me

    const fromSummary = s?.plan?.name?.trim();
    if (fromSummary && fromSummary.toLowerCase() !== "free") return fromSummary;

    return s?.has_subscription ? "Active plan" : "Free";
  }

  const planName = resolvedPlanName(summary, me);
  //const planId = me?.membership_plan_id ?? summary?.plan?.id ?? null;

  function formatMoneyCents(
    amountCents: number | null | undefined,
    currency: string | null | undefined
  ) {
    if (amountCents == null) return "—";
    const iso = (currency || "usd").toUpperCase();
    const value = amountCents / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: iso,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${iso}`;
    }
  }

  function formatMoneyDollars(amount: number | null | undefined) {
    if (amount == null) return "—";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  async function openBillingPortal() {
    setOpeningPortal(true);
    setErr(null);
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
      if (!res.ok) throw new Error(json?.message || json?.error || `Error ${res.status}`);
      if (json?.url) {
        window.location.href = json.url;
      } else {
        throw new Error("No portal URL returned.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unable to open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  }

  // --------- UI ---------
  return (
    <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 d-flex align-items-center gap-2">
          <FiInfo /> Subscription Details
        </h6>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={load}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className="me-1" />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={openBillingPortal}
            disabled={openingPortal}
            title="Manage payment methods & invoices"
          >
            <FiSettings className="me-1" />
            Manage Billing
          </button>
        </div>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      {loading ? (
        <div className="text-muted small">Loading subscription…</div>
      ) : (
        <div className="card subscription-card shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                    
                <h5>Plan</h5>
                </div>
                <div className="fw-semibold">
                  <h5 className="mb-0 text-bold">{planName}</h5>
                  {/* {planId ? <span className="text-muted small ms-2">({planId})</span> : null} */}
                </div>

                {Array.isArray(me?.plan_features) && me!.plan_features!.length > 0 && (
                  <ul className="list-unstyled small mt-2 mb-0">
                    {me!.plan_features!.slice(0, 6).map((f) => (
                      <li key={f} className="text-muted">
                        {f}
                      </li>
                    ))}
                    {me!.plan_features!.length > 6 && <li className="text-muted">…and more</li>}
                  </ul>
                )}
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">Status</div>
                <div>
                  {summary?.status ? (
                    <span className="badge bg-light text-dark border">{summary.status}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                  {summary?.cancel_at_period_end && (
                    <span className="badge bg-warning-subtle text-dark ms-2">Will cancel at period end</span>
                  )}
                </div>
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                  <FiDollarSign className="me-1" />
                  Next charge
                </div>
                <div className="fw-semibold">
                  {formatMoneyCents(summary?.next_bill?.amount ?? null, summary?.next_bill?.currency ?? undefined)}
                </div>
                {!summary?.has_subscription && me?.plan_price != null && (
                  <div className="text-muted small">Plan price: {formatMoneyDollars(me.plan_price)} / mo</div>
                )}
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                  <FiCalendar className="me-1" />
                  Next bill date
                </div>
                <div className="fw-semibold">{formatDate(summary?.next_bill?.date_iso ?? null)}</div>
              </div>
            </div>

            {!summary?.has_subscription && (
              <p className="text-muted small mt-3 mb-0">
                You don’t have an active subscription. Choose a paid plan to start one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
