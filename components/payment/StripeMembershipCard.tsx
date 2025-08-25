// components/payment/StripeMembershipCard.tsx
// components/payment/StripeMembershipCard.tsx
'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiZap } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';

export type UIMembershipPlan = {
  id: string | null;          // MembershipPlan UUID (null for Free)
  name: string;
  price: string;              // "$9/mo" etc
  badge?: string | null;
  gradient?: string | null;
  description?: string | null;
  features?: string[];
  stripe_price_id?: string | null;
};

type Props = {
  plan: UIMembershipPlan;
  isCurrent: boolean;
  saving?: boolean;
  onBeforeRedirect?: () => void;
  previewCount?: number;
  apiBase?: string;
  successPath?: string;       // <- point this to /billing/success
  cancelPath?: string;
};

export default function StripeMembershipCard({
  plan,
  isCurrent,
  saving = false,
  onBeforeRedirect,
  previewCount = 4,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  successPath = '/billing/success',   // ✅ default to your handler page
  cancelPath = '/profile',
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const titleId = useId();

  const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0;
  const preview = hasFeatures ? plan.features!.slice(0, previewCount) : [];
  const hiddenCount = hasFeatures ? Math.max(0, plan.features!.length - preview.length) : 0;

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  async function confirm() {
    setErr(null);
    setBusy(true);

    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      if (!stripe) throw new Error('Stripe failed to initialize (check publishable key).');

      // Store chosen plan for your /billing/success page (optional)
      try {
        localStorage.setItem('preselectedPlanId', plan.id ?? 'free');
      } catch {}

      const base = apiBase.replace(/\/+$/, '');
      const res = await fetch(`${base}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan_id: plan.id,                 // used by backend
          stripe_price_id: plan.stripe_price_id, // harmless extra
          success_path: successPath,        // ✅ send /billing/success
          cancel_path: cancelPath,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const m = (json && (json.error || json.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

      // Prefer hosted url if present (avoids pk/sk mismatch issues)
      if (json?.url) {
        onBeforeRedirect?.();
        window.location.href = json.url;
      } else if (json?.sessionId) {
        onBeforeRedirect?.();
        const { error } = await stripe.redirectToCheckout({ sessionId: json.sessionId });
        if (error) throw error;
      } else {
        throw new Error('Checkout session missing url/sessionId.');
      }

      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to start checkout.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        className="card h-100 shadow-sm membership-card"
        style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,.06)' }}
      >
        <div
          className="membership-card__head"
          style={{
            background:
              plan.gradient || 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))',
            padding: '14px 16px',
            color: '#222',
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="fw-semibold">{plan.name}</div>
            {plan.badge && <span className="badge bg-light text-dark border">{plan.badge}</span>}
          </div>
          <div className="fs-5 mt-1">{plan.price}</div>
        </div>

        <div className="card-body">
          {plan.description && <p className="small text-muted mb-2">{plan.description}</p>}

          {hasFeatures && (
            <ul className="list-unstyled small m-0">
              {preview.map((label) => (
                <li key={label} className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: 'rgba(126,142,241,.18)',
                      color: '#6b7cff',
                    }}
                    aria-hidden
                  >
                    <FiCheck />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          )}

          {hiddenCount > 0 && (
            <div className="mt-2">
              <span className="pill-count" aria-hidden>
                +{hiddenCount} more
              </span>
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-0 pb-3 d-flex justify-content-between align-items-center">
          <button
            type="button"
            className={`btn btn-sm ${isCurrent ? 'btn-outline-secondary' : 'btn-primary'} btn-thin`}
            onClick={() => setOpen(true)}
            disabled={saving || isCurrent}
            style={{ borderRadius: 10 }}
          >
            {isCurrent
              ? 'Current plan'
              : plan.name.toLowerCase() === 'free'
              ? 'Switch to Free'
              : 'Choose Plan'}
            {!isCurrent && <FiZap className="text-white" style={{ marginLeft: 6, marginTop: -2 }} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="membership-modal"
            aria-labelledby={titleId}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="membership-modal__backdrop" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              className="membership-modal__dialog"
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
            >
              <div className="membership-modal__header" style={{ background: plan.gradient || undefined }}>
                <h5 id={titleId} className="m-0">
                  {plan.name}
                </h5>
                <button type="button" className="btn btn-sm btn-light" onClick={() => setOpen(false)} aria-label="Close">
                  <FiX />
                </button>
              </div>

              <div className="membership-modal__body">
                {err && <div className="alert alert-danger py-2">{err}</div>}

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fs-5 fw-semibold">{plan.price}</div>
                  {plan.badge && <span className="badge bg-light text-dark border">{plan.badge}</span>}
                </div>

                {plan.description && <p className="small text-muted">{plan.description}</p>}

                {hasFeatures && (
                  <ul className="list-unstyled small m-0">
                    {plan.features!.map((label) => (
                      <li key={label} className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className="d-inline-flex align-items-center justify-content-center"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: 'rgba(126,142,241,.18)',
                            color: '#6b7cff',
                          }}
                          aria-hidden
                        >
                          <FiCheck />
                        </span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="membership-modal__footer">
                <button type="button" className="btn btn-outline-secondary btn-thin" onClick={() => setOpen(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-thin"
                  onClick={confirm}
                  disabled={busy || saving || isCurrent}
                >
                  {isCurrent
                    ? 'Current plan'
                    : plan.name.toLowerCase() === 'free'
                    ? 'Switch to Free'
                    : 'Continue to Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



/*

'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiZap } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';

export type UIMembershipPlan = {
  id: string | null;          // your MembershipPlan UUID (null for Free)
  name: string;
  price: string;              // "$9/mo" etc
  badge?: string | null;
  gradient?: string | null;
  description?: string | null;
  features?: string[];
};

type Props = {
  plan: UIMembershipPlan;
  isCurrent: boolean;         // if the logged-in user already has this plan
  saving?: boolean;
 
  onBeforeRedirect?: () => void;
 
  previewCount?: number;
 
  apiBase?: string;
  
  successPath?: string;       // e.g. "/welcome" or "/profile/onboarding"

  cancelPath?: string;        // e.g. "/"
};

export default function StripeMembershipCard({
  plan,
  isCurrent,
  saving = false,
  onBeforeRedirect,
  previewCount = 4,
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  successPath = '/welcome',
  cancelPath = '/',
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const titleId = useId();

  const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0;
  const preview = hasFeatures ? plan.features!.slice(0, previewCount) : [];
  const hiddenCount = hasFeatures ? Math.max(0, plan.features!.length - preview.length) : 0;

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  async function confirm() {
    setErr(null);
    setBusy(true);

    try {
    
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
      );
      if (!stripe) {
        throw new Error('Stripe failed to initialize (check publishable key).');
      }

    
      const base = apiBase.replace(/\/+$/, '');
      const res = await fetch(`${base}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan_id: plan.id,                  // can be null (Free) – backend should handle that
          success_path: successPath,         // e.g. "/welcome"
          cancel_path: cancelPath,           // e.g. "/"
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const m = (json && (json.error || json.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

   
      if (json.sessionId) {
        onBeforeRedirect?.();
        const { error } = await stripe.redirectToCheckout({
          sessionId: json.sessionId,
        });
        if (error) throw error;
      } else if (json.url) {
        onBeforeRedirect?.();
        window.location.href = json.url; // fallback
      } else {
        throw new Error('Checkout session missing url/sessionId.');
      }

      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to start checkout.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        className="card h-100 shadow-sm membership-card"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,.06)',
        }}
      >
        <div
          className="membership-card__head"
          style={{
            background:
              plan.gradient ||
              'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))',
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
          {plan.description && (
            <p className="small text-muted mb-2">{plan.description}</p>
          )}

        
          {hasFeatures && (
            <ul className="list-unstyled small m-0">
              {preview.map((label) => (
                <li key={label} className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: 'rgba(126,142,241,.18)',
                      color: '#6b7cff',
                    }}
                    aria-hidden
                  >
                    <FiCheck />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          )}

        
          {hiddenCount > 0 && (
            <div className="mt-2">
              <span className="pill-count" aria-hidden>
                +{hiddenCount} more
              </span>
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-0 pb-3 d-flex justify-content-between align-items-center">
          <button
            type="button"
            className={`btn btn-sm ${
              isCurrent ? 'btn-outline-secondary' : 'btn-primary'
            } btn-thin`}
            onClick={() => setOpen(true)}
            disabled={saving || isCurrent}
            style={{ borderRadius: 10 }}
          >
            {isCurrent
              ? 'Current plan'
              : plan.name.toLowerCase() === 'free'
              ? 'Switch to Free'
              : 'Choose Plan'}
            {!isCurrent && (
              <FiZap className="text-white" style={{ marginLeft: 6, marginTop: -2 }} />
            )}
          </button>
        </div>
      </motion.div>

   
      <AnimatePresence>
        {open && (
          <motion.div
            className="membership-modal"
            aria-labelledby={titleId}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="membership-modal__backdrop"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              className="membership-modal__dialog"
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
            >
              <div
                className="membership-modal__header"
                style={{ background: plan.gradient || undefined }}
              >
                <h5 id={titleId} className="m-0">
                  {plan.name}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              <div className="membership-modal__body">
                {err && (
                  <div className="alert alert-danger py-2">{err}</div>
                )}

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fs-5 fw-semibold">{plan.price}</div>
                  {plan.badge && (
                    <span className="badge bg-light text-dark border">{plan.badge}</span>
                  )}
                </div>

                {plan.description && (
                  <p className="small text-muted">{plan.description}</p>
                )}

                {hasFeatures && (
                  <ul className="list-unstyled small m-0">
                    {plan.features!.map((label) => (
                      <li key={label} className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className="d-inline-flex align-items-center justify-content-center"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: 'rgba(126,142,241,.18)',
                            color: '#6b7cff',
                          }}
                          aria-hidden
                        >
                          <FiCheck />
                        </span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="membership-modal__footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-thin"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-thin"
                  onClick={confirm}
                  disabled={busy || saving || isCurrent}
                >
                  {isCurrent
                    ? 'Current plan'
                    : plan.name.toLowerCase() === 'free'
                    ? 'Switch to Free'
                    : 'Continue to Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

*/