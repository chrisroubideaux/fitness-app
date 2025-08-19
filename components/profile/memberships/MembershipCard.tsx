// components/profile/memberships/MembershipCard.tsx
'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiZap } from 'react-icons/fi';

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
  /** Called when user confirms inside the modal */
  onSelect: () => Promise<void> | void;
  /** How many features to preview on the card (default 4) */
  previewCount?: number;
};

export default function MembershipCard({
  plan,
  isCurrent,
  saving = false,
  onSelect,
  previewCount = 4,
}: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0;
  const preview = hasFeatures ? plan.features!.slice(0, previewCount) : [];
  const hiddenCount = hasFeatures ? Math.max(0, plan.features!.length - preview.length) : 0;

  async function confirm() {
    await onSelect?.();
    setOpen(false);
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
            background: plan.gradient || 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))',
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

          {/* Preview (truncated) features */}
          {hasFeatures && (
            <ul className="list-unstyled small m-0">
              {preview.map((label) => (
                <li key={label} className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center"
                    style={{
                      width: 20, height: 20, borderRadius: 999,
                      background: 'rgba(126,142,241,.18)', color: '#6b7cff',
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

          {/* “+N more” pill to hint at additional features */}
          {hiddenCount > 0 && (
            <div className="mt-2">
              <span className="pill-count" aria-hidden>+{hiddenCount} more</span>
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-0 pb-3 d-flex justify-content-between align-items-center">
          {/*Button opens the modal */}
          <button
            type="button"
            className={`btn btn-sm ${isCurrent ? 'btn-outline-secondary' : 'btn-primary'} btn-thin`}
            onClick={() => setOpen(true)}
            disabled={saving}
            style={{ borderRadius: 10 }}
          >
            {isCurrent ? 'Current plan' : plan.name.toLowerCase() === 'free' ? 'Switch to Free' : 'Choose Plan'}
            {!isCurrent && <FiZap className='text-white' style={{ marginLeft: 6, marginTop: -2 }} />}
          </button>

        </div>
      </motion.div>

      {/* Centered modal with full feature list + confirm */}
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
              <div className="membership-modal__header" style={{ background: plan.gradient || undefined }}>
                <h5 id={titleId} className="m-0">{plan.name}</h5>
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
                  {plan.badge && <span className="badge bg-light text-dark border">{plan.badge}</span>}
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
                            width: 20, height: 20, borderRadius: 999,
                            background: 'rgba(126,142,241,.18)', color: '#6b7cff',
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
                  className={`btn btn-primary btn-thin`}
                  onClick={confirm}
                  disabled={saving || isCurrent}
                >
                  {isCurrent ? 'Current plan' : plan.name.toLowerCase() === 'free' ? 'Switch to Free' : 'Confirm Plan'}
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

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import React from 'react';

export type ApiPlan = {
  id: string;
  name: string;
  price: number;           // dollars per month
  description: string;
  features: string[];
};

export type UiPlan = ApiPlan & {
  gradient: string;
  badge?: string;
};

type Props = {
  plan: UiPlan;
  isCurrent: boolean;
  saving?: boolean;
  onSelect: () => void;
};

export default function MembershipCard({
  plan,
  isCurrent,
  saving = false,
  onSelect,
}: Props) {
  // Price label
  const priceLabel = plan.price === 0 ? '$0' : `$${plan.price.toFixed(2)}/mo`;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card membership-card h-100 shadow-sm"
      style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,.06)' }}
    >
     
      <div className="membership-hero" style={{ background: plan.gradient }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">{plan.name}</div>
          {plan.badge && <span className="membership-badge">{plan.badge}</span>}
        </div>
        <div className="fs-5 mt-1">{priceLabel}</div>
      </div>

      
      <div className="card-body">
        <div className="small text-muted mb-2">{plan.description}</div>
        <ul className="list-unstyled small m-0">
          {plan.features.map((label) => (
            <li key={label} className="d-flex align-items-center gap-2 mb-2">
              <span className="membership-feature-icon">
                <FiCheck />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>

    
      <div className="card-footer bg-white border-0 pb-3">
        <button
          className={`btn btn-sm ${isCurrent ? 'btn-outline-secondary' : 'btn-primary'} btn-thin`}
          onClick={onSelect}
          disabled={saving || isCurrent}
          style={{ borderRadius: 10 }}
        >
          {isCurrent ? 'Current plan' : plan.name.toLowerCase() === 'free' ? 'Switch to Free' : 'Choose Plan'}
        </button>
      </div>
    </motion.div>
  );
}

*/