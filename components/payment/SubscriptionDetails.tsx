// components/payment/SubscriptionDetails.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { JSX } from "react";
import {
  FiRefreshCw,
  
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiBarChart,
  FiCheckCircle,
  FiMessageCircle,
  FiActivity,
  FiEdit3,
  FiRepeat,
  FiVideo,
  FiClock,
  FiLink,
  FiAward,
  FiUsers,
  FiCheck,
  FiBell,
} from "react-icons/fi";

type Summary = {
  has_subscription: boolean;
  plan: { id: string | null; name: string | null };
  next_bill: {
    amount: number | null;
    currency: string | null;
    date_unix: number | string | null;
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
  plan_name?: string | null;
  plan_price?: number | null;
  plan_features?: string[];
};

const PREVIEW_COUNT = 6;

export default function SubscriptionDetails({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: { apiBase?: string }) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [showAllPerks, setShowAllPerks] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const bust = `?t=${Date.now()}`;
      const [sumRes, meRes] = await Promise.all([
        fetch(`${base}/api/payments/summary${bust}`, { headers, cache: "no-store" }),
        fetch(`${base}/api/users/me${bust}`, { headers, cache: "no-store" }),
      ]);
      const [sumJson, meJson] = await Promise.all([
        sumRes.json().catch(() => null),
        meRes.json().catch(() => null),
      ]);
      if (!sumRes.ok && !meRes.ok) {
        const m =
          sumJson?.message || sumJson?.error || meJson?.message || meJson?.error ||
          `Summary ${sumRes.status} / Me ${meRes.status}`;
        throw new Error(m);
      }
      if (sumRes.ok) setSummary(sumJson as Summary);
      if (meRes.ok) setMe(meJson as Me);
      setShowAllPerks(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // helper function
  const planName = (() => {
    const fromMe = me?.plan_name?.trim();
    if (fromMe) return fromMe;
    const fromSummary = summary?.plan?.name?.trim();
    if (fromSummary && fromSummary.toLowerCase() !== "free") return fromSummary;
    return summary?.has_subscription ? "Active plan" : "Free";
  })();

  function formatMoneyCents(amountCents: number | null | undefined, currency: string | null | undefined) {
    if (amountCents == null) return null;
    const iso = (currency || "usd").toUpperCase();
    const value = amountCents / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: iso, maximumFractionDigits: 2 }).format(value);
    } catch {
      return `${value.toFixed(2)} ${iso}`;
    }
  }
  function formatMoneyDollars(amount: number | null | undefined) {
    if (amount == null) return null;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  function formatLongDate(iso?: string | null, unixMaybe?: number | string | null) {
    const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    if (iso) {
      try { return new Date(iso).toLocaleDateString(undefined, opts); } catch { return iso; }
    }
    if (unixMaybe != null && String(unixMaybe).trim() !== "") {
      const n = Number(unixMaybe);
      if (!Number.isNaN(n)) {
        const ms = n > 10_000_000_000 ? n : n * 1000;
        const d = new Date(ms);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(undefined, opts);
      }
    }
    return "—";
  }

  const nextCharge =
    formatMoneyCents(summary?.next_bill?.amount ?? null, summary?.next_bill?.currency ?? undefined)
    ?? (me?.plan_price != null ? `${formatMoneyDollars(me.plan_price)} / mo` : "—");

  const nextDueDate = formatLongDate(summary?.next_bill?.date_iso ?? null, summary?.next_bill?.date_unix ?? null);

  async function openBillingPortal() {
    setOpeningPortal(true);
    setErr(null);
    try {
      const res = await fetch(`${base}/api/payments/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || json?.error || `Error ${res.status}`);
      if (json?.url) window.location.href = json.url;
      else throw new Error("No portal URL returned.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unable to open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  }

  // Perk icons:
  const featureIconMap: Record<string, JSX.Element> = {
    "✅": <FiCheckCircle className="bio-icon" />,
    "📅": <FiCalendar className="bio-icon" />,
    "💬": <FiMessageCircle className="bio-icon" />,
    "🧘": <FiActivity className="bio-icon" />,
    "🧘‍♂️": <FiActivity className="bio-icon" />,
    "📝": <FiEdit3 className="bio-icon" />,
    "🔁": <FiRepeat className="bio-icon" />,
    "🔄": <FiRefreshCw className="bio-icon" />,
    "🎥": <FiVideo className="bio-icon" />,
    "⏱": <FiClock className="bio-icon" />,
    "⏱️": <FiClock className="bio-icon" />,
    "🔗": <FiLink className="bio-icon" />,
    "🏆": <FiAward className="bio-icon" />,
    "👥": <FiUsers className="bio-icon" />,
    "📈": <FiBarChart className="bio-icon" />,
    "🛎️": <FiBell className="bio-icon" />,
    // "🍎":
    "🍎": <FiBarChart className="bio-icon" />,
  };

  function iconForFeature(text: string) {
    for (const key of Object.keys(featureIconMap)) {
      if (text.startsWith(key)) return featureIconMap[key];
    }
    return <FiCheck className="bio-icon" />;
  }

  function stripLeadingEmoji(text: string) {
    const pattern = /^(✅|📅|💬|🧘‍♂️|🧘|📝|🔁|🔄|🎥|⏱️|⏱|🔗|🏆|👥|📈|🛎️|🍎)[\s–-]*/u;
    return text.replace(pattern, "").trim();
  }

  const uniquePerks = Array.from(new Set(me?.plan_features ?? []));
  const totalPerks = uniquePerks.length;
  const visiblePerks = showAllPerks ? uniquePerks : uniquePerks.slice(0, PREVIEW_COUNT);
  const hasOverflow = totalPerks > PREVIEW_COUNT;

  return (
    <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">
      <div className="d-flex align-items-center justify-content-between mb-3">
        
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading} title="Refresh">
            <FiRefreshCw className="me-1" /> Refresh
          </button>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={openBillingPortal} disabled={openingPortal} title="Manage payment methods & invoices">
            <FiSettings className="me-1" /> Manage Billing
          </button>
        </div>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      {loading ? (
        <div className="text-muted small">Loading subscription…</div>
      ) : (
        <div className="subscription-card shadow-lg" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <div className="row g-4">
              {/* LEFT: Current Plan */}
              <div className="col-lg-7">
                <div className="">
                  <h4 className="fw-normal me-1 fs-6 text-uppercase">
                    Current Plan
                  </h4>
                </div>
                <div className="d-flex align-items-center gap-2 pt-2">
                  <h4 className="m-0" style={{ fontSize: "1.25rem" }}>
                    <FiBarChart className="bio-icon me-2" />
                    {planName}
                  </h4>
                </div>

                {/* Status directly under plan name */}
                <div className="mt-2">
                  <span className="small text-muted text-uppercase">Status</span>
                  <div>
                    {summary?.status ? (
                      <span className="badge p-2 border pt-2">{summary.status}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                    {summary?.cancel_at_period_end && (
                      <span className="badge bg-warning-subtle text-dark ms-2">Will cancel at period end</span>
                    )}
                  </div>
                </div>

                {/* Perks */}
                {totalPerks > 0 && (
                  <div className="mt-4">
                    <ul className="list-unstyled m-0">
                      {visiblePerks.map((raw) => {
                        const icon = iconForFeature(raw);
                        const label = stripLeadingEmoji(raw);
                        return (
                          <li key={raw} className="d-flex align-items-center gap-2 mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center" aria-hidden>
                              {icon}
                            </span>
                            <span className="text-muted">{label}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {hasOverflow && (
                      <button
                        type="button"
                        className="btn btn-sm mt-2"
                        onClick={() => setShowAllPerks((v) => !v)}
                        aria-expanded={showAllPerks}
                      >
                        {showAllPerks ? (
                          <>
                            <FiChevronUp className="bio-icon me-1" /> Show less
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="bio-icon me-1" /> Show all {totalPerks} perks
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: Next charge + Next due date */}
              <div className="col-lg-5">
                <div className="mb-3">
                  <div className="">
                    <h4 className="fw-normal me-1 fs-6 text-uppercase">
                    <FiDollarSign className="bio-icon me-1" />
                    Next charge
                    </h4>
                  </div>
                  <div className="fw-semibold">
                    <h5 className="text-muted fs-6">{nextCharge}</h5>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="">
                    <h4 className="fw-normal me-1 fs-6 text-uppercase">
                    <FiCalendar className="bio-icon me-1" />
                       Next due date
                    </h4>
                  </div>
                  <div className="fw-semibold">
                    <h5 className="text-muted fs-6">{nextDueDate}</h5>
                  </div>
                </div>
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




/*
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiRefreshCw,
  FiInfo,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiBarChart,
} from "react-icons/fi";

type Summary = {
  has_subscription: boolean;
  plan: { id: string | null; name: string | null };
  next_bill: {
    amount: number | null;
    currency: string | null;
    date_unix: number | string | null; 
    date_iso: string | null;
  } | null;
  status?: string | null;
  cancel_at_period_end?: boolean;
  debug?: {
   
    sub_id?: string | null;
    effective_due_unix?: number | string | null; 
    upcoming_period_end?: number | string | null; 
    invoice_period_end?: number | string | null;
    current_period_end?: number | string | null;

    // older fields you may already be returning
    current_period_end_raw?: number | string | null;
    current_period_end_sec?: number | null;
    upcoming_period_end_sec?: number | null;
  };
};

type Me = {
  id: string;
  email: string;
  full_name?: string | null;
  membership_plan_id: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
  plan_features?: string[];
};

const PREVIEW_COUNT = 6;

export default function SubscriptionDetails({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
}: { apiBase?: string }) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const debugView = typeof window !== "undefined" && localStorage.getItem("showSummaryDebug") === "1";

  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [showAllPerks, setShowAllPerks] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const bust = `?t=${Date.now()}`;
      const [sumRes, meRes] = await Promise.all([
        fetch(`${base}/api/payments/summary${bust}`, { headers, cache: "no-store" }),
        fetch(`${base}/api/users/me${bust}`, { headers, cache: "no-store" }),
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
      if (sumRes.ok) {
        if (debugView) console.log("[/summary]", sumJson);
        setSummary(sumJson as Summary);
      }
      if (meRes.ok) setMe(meJson as Me);
      setShowAllPerks(false);
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

  // Soft re-try once if we’re missing dates on a fresh activation
  useEffect(() => {
    const s = summary;
    if (!s) return;
    const activeish = s.status === "active" || s.status === "trialing" || s.status === "past_due";
    const hasIso = !!s.next_bill?.date_iso;
    const hasUnix = s.next_bill?.date_unix != null && String(s.next_bill.date_unix).trim() !== "";
    if (activeish && !hasIso && !hasUnix) {
      const t = setTimeout(load, 1500);
      return () => clearTimeout(t);
    }
  }, [summary]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- helpers ----------
  function resolvedPlanName(s: Summary | null, m: Me | null) {
    const fromMe = m?.plan_name?.trim();
    if (fromMe) return fromMe;
    const fromSummary = s?.plan?.name?.trim();
    if (fromSummary && fromSummary.toLowerCase() !== "free") return fromSummary;
    return s?.has_subscription ? "Active plan" : "Free";
  }
  const planName = resolvedPlanName(summary, me);

  function formatMoneyCents(amountCents: number | null | undefined, currency: string | null | undefined) {
    if (amountCents == null) return null;
    const iso = (currency || "usd").toUpperCase();
    const value = amountCents / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: iso, maximumFractionDigits: 2 }).format(value);
    } catch {
      return `${value.toFixed(2)} ${iso}`;
    }
  }
  function formatMoneyDollars(amount: number | null | undefined) {
    if (amount == null) return null;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  const nextCharge =
    formatMoneyCents(summary?.next_bill?.amount ?? null, summary?.next_bill?.currency ?? undefined) ??
    (me?.plan_price != null ? `${formatMoneyDollars(me.plan_price)} / mo` : "—");

  // Prefer ISO; else UNIX; else debug fallbacks (covers "Your subscription renews on …" case)
  const candidateUnix =
    summary?.next_bill?.date_unix ??
    summary?.debug?.effective_due_unix ??
    summary?.debug?.upcoming_period_end ??
    summary?.debug?.invoice_period_end ??
    summary?.debug?.current_period_end ??
    summary?.debug?.current_period_end_sec ??
    summary?.debug?.upcoming_period_end_sec ??
    summary?.debug?.current_period_end_raw ??
    null;

  const nextBillDate = (() => {
    const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    const iso = summary?.next_bill?.date_iso || null;
    if (iso) {
      try {
        return new Date(iso).toLocaleDateString(undefined, opts);
      } catch {}
    }
    if (candidateUnix != null && String(candidateUnix).trim() !== "") {
      const n = Number(candidateUnix);
      if (!Number.isNaN(n)) {
        const ms = n > 10_000_000_000 ? n : n * 1000; // sec → ms safety
        const d = new Date(ms);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(undefined, opts);
      }
    }
    return "—";
  })();

  async function openBillingPortal() {
    setOpeningPortal(true);
    setErr(null);
    try {
      const res = await fetch(`${base}/api/payments/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || json?.error || `Error ${res.status}`);
      if (json?.url) window.location.href = json.url;
      else throw new Error("No portal URL returned.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unable to open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  }

  // perks
  const uniquePerks = Array.from(new Set(me?.plan_features ?? []));
  const totalPerks = uniquePerks.length;
  const visiblePerks = showAllPerks ? uniquePerks : uniquePerks.slice(0, PREVIEW_COUNT);
  const hasOverflow = totalPerks > PREVIEW_COUNT;

  return (
    <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">
      <div className="d-flex align-items-center justify-content-between mb-3">
        
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading} title="Refresh">
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
        <div className="subscription-card shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <div className=" small">
                    <h4 className="fw-normal  me-1" >
                      <FiBarChart className="bio-icon me-1" />   
                      Current Plan
                    </h4>
                    </div>
                <div className="fw-semibold pt-3">
                  <h1 style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                    {planName}
                  </h1>
                </div>

                {totalPerks > 0 && (
                  <>
                    <ul className="list-unstyled small mt-2 mb-2 mt-3">
                      {visiblePerks.map((f) => (
                        <li key={f} className="">
                          <h3 style={{ fontSize: "0.9rem", lineHeight: 1.2 }}>
                            {f}
                          </h3>
                        </li>
                      ))}
                    </ul>

                    {hasOverflow && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setShowAllPerks((v) => !v)}
                        aria-expanded={showAllPerks}
                        aria-controls="perks-list"
                      >
                        {showAllPerks ? (
                          <>
                            <FiChevronUp className="me-1" /> Show less
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="me-1" /> Show all {totalPerks} perks
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-muted small">
                    <h5 className="  me-1" >
                      <FiInfo />   Status
                    </h5>
                </div>
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
                    <FiDollarSign className="bio-icon me-1" />
                    Next charge
                </div>
                <div className="fw-semibold me-1">{nextCharge}</div>
              </div>

              <div className="col-sm-6">
                <div className="text-uppercase text-grey small">
                  <FiCalendar className=" bio-icon me-1" />
                  Next due date
                </div>
                <div className="fw-semibold">{nextBillDate}</div>
                {debugView && (
                  <div className="small text-muted mt-1">
                    raw iso: {String(summary?.next_bill?.date_iso ?? "null")} · raw unix:{" "}
                    {String(summary?.next_bill?.date_unix ?? "null")} · candidate: {String(candidateUnix ?? "null")}
                  </div>
                )}
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

      {debugView && (
        <pre className="small mt-3 bg-light p-2 rounded">{JSON.stringify(summary, null, 2)}</pre>
      )}
    </div>
  );
}



*/