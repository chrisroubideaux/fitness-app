// components/profile/payment/SubscriptionDetails.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiInfo, FiCalendar, FiDollarSign, FiSettings } from "react-icons/fi";

type Summary = {
  has_subscription: boolean;
  plan: { id: string | null; name: string | null };
  next_bill: {
    amount: number | null;      // Stripe cents
    currency: string | null;    // e.g. 'usd'
    date_unix: number | null;
    date_iso: string | null;
  } | null;
  status?: string | null;        // e.g. 'active', 'trialing'
  cancel_at_period_end?: boolean;
};

export default function SubscriptionDetails({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: {
  apiBase?: string;
}) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/payments/summary`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || json?.error || `Error ${res.status}`);
      setData(json as Summary);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatMoney(amount: number | null | undefined, currency: string | null | undefined) {
    if (amount == null) return "—";
    const iso = (currency || "usd").toUpperCase();
    // Stripe totals are in the smallest unit (cents)
    const value = amount / 100;
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
        <div className="card shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">Plan</div>
                <div className="fw-semibold">{data?.plan?.name || "Free"}</div>
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">Status</div>
                <div>
                  {data?.status ? (
                    <span className="badge bg-light text-dark border">
                      {data.status}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                  {data?.cancel_at_period_end && (
                    <span className="badge bg-warning-subtle text-dark ms-2">
                      Will cancel at period end
                    </span>
                  )}
                </div>
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                  <FiDollarSign className="me-1" />
                  Next charge
                </div>
                <div className="fw-semibold">
                  {formatMoney(data?.next_bill?.amount ?? null, data?.next_bill?.currency ?? undefined)}
                </div>
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                  <FiCalendar className="me-1" />
                  Next bill date
                </div>
                <div className="fw-semibold">
                  {formatDate(data?.next_bill?.date_iso ?? null)}
                </div>
              </div>
            </div>

            {!data?.has_subscription && (
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
