// components/profile/memberships/MembershipCard.tsx
'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiAlertTriangle } from 'react-icons/fi';

export type UIMembershipPlan = {
  id: string | null;
  name: string;
  price: string;
  badge?: string | null;
  gradient?: string | null;
  description?: string | null;
  features?: string[];
};

type Props = {
  plan: UIMembershipPlan;
  isCurrent: boolean;
  saving?: boolean;
  onSelect: () => Promise<void> | void;
  previewCount?: number;
  isAuthenticated?: boolean;
  loginPath?: string;
  onAuthRedirect?: (planId?: string | null) => void;
};

export default function MembershipCard({
  plan,
  isCurrent,
  saving = false,
  onSelect,
  previewCount = 4,
  isAuthenticated = false,
  loginPath = '/login',
  onAuthRedirect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [openWarn, setOpenWarn] = useState(false);
  const titleId = useId();

  const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0;
  const preview = hasFeatures ? plan.features!.slice(0, previewCount) : [];
  const hiddenCount = hasFeatures
    ? Math.max(0, plan.features!.length - preview.length)
    : 0;

  async function confirm() {
    if (!isAuthenticated) {
      setOpenWarn(true);
      return;
    }
    await onSelect?.();
    setOpen(false);
  }

  function handleWarnContinue() {
    const chosenId = plan.id ?? 'free';
    try {
      localStorage.setItem('preselectedPlanId', chosenId);
    } catch {}
    if (onAuthRedirect) {
      onAuthRedirect(chosenId);
    } else {
      window.location.href = `${loginPath}?planId=${encodeURIComponent(
        chosenId
      )}`;
    }
  }

  // 🎬 Framer Motion variants for scroll + hover
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <>
      {/* ✨ Scroll-triggered + hover animation */}
      <motion.div
        className="card h-100 shadow-sm membership-card"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,.06)',
        }}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        whileHover="hover"
        whileTap="tap"
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
              <span className="badge bg-light text-dark border">
                {plan.badge}
              </span>
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
                <li
                  key={label}
                  className="d-flex align-items-center gap-2 mb-2"
                >
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
            disabled={saving}
            style={{ borderRadius: 10 }}
          >
            {isCurrent
              ? 'Current plan'
              : plan.name.toLowerCase() === 'free'
              ? 'Switch to Free'
              : 'Choose Plan'}
            {!isCurrent && (
              <FiZap
                className="text-white"
                style={{ marginLeft: 6, marginTop: -2 }}
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* 💬 Confirmation Modal */}
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
            style={{ zIndex: 1060 }}
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
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fs-5 fw-semibold">{plan.price}</div>
                  {plan.badge && (
                    <span className="badge bg-light text-dark border">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {plan.description && (
                  <p className="small text-muted">{plan.description}</p>
                )}

                {hasFeatures && (
                  <ul className="list-unstyled small m-0">
                    {plan.features!.map((label) => (
                      <li
                        key={label}
                        className="d-flex align-items-center gap-2 mb-2"
                      >
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
                  disabled={saving || isCurrent}
                >
                  {isCurrent
                    ? 'Current plan'
                    : plan.name.toLowerCase() === 'free'
                    ? 'Switch to Free'
                    : 'Confirm Plan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ Login Required Modal */}
      <AnimatePresence>
        {openWarn && (
          <motion.div
            className="membership-modal"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1061 }}
          >
            <div
              className="membership-modal__backdrop"
              onClick={() => setOpenWarn(false)}
              aria-hidden
            />
            <motion.div
              className="membership-modal__dialog"
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
            >
              <div
                className="membership-modal__header"
                style={{
                  background:
                    'linear-gradient(135deg, #fffbe6, #ffffff)',
                }}
              >
                <h5 className="m-0 d-flex align-items-center gap-2">
                  <FiAlertTriangle /> Create an account to continue
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setOpenWarn(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              <div className="membership-modal__body">
                <p className="small text-muted mb-2">
                  You need an account to choose a plan and manage billing.
                </p>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="fw-semibold">{plan.name}</div>
                  <div className="text-muted">{plan.price}</div>
                </div>
              </div>

              <div className="membership-modal__footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-thin"
                  onClick={() => setOpenWarn(false)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-thin"
                  onClick={handleWarnContinue}
                >
                  Sign in / Create account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
