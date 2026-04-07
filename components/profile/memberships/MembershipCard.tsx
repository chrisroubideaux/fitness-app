// components/profile/memberships/MembershipCard.tsx

'use client';

import React, { useId, useMemo, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FiCheck,
  FiX,
  FiZap,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi';

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

  const cardGradient = useMemo(
    () =>
      plan.gradient ||
      'linear-gradient(135deg, rgba(126,142,241,.22), rgba(91,209,215,.22))',
    [plan.gradient]
  );

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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' },
    },
    hover: {
      y: -8,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
    tap: { scale: 0.985 },
  };

  const actionLabel = isCurrent
    ? 'Current plan'
    : plan.name.toLowerCase() === 'free'
    ? 'Switch to Free'
    : 'Choose Plan';

  const confirmLabel = isCurrent
    ? 'Current plan'
    : plan.name.toLowerCase() === 'free'
    ? 'Switch to Free'
    : 'Confirm Plan';

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        whileHover="hover"
        whileTap="tap"
        style={{
          height: '100%',
          borderRadius: 28,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
          border: isCurrent
            ? '1px solid rgba(139,92,246,0.22)'
            : '1px solid rgba(15,23,42,0.07)',
          boxShadow: isCurrent
            ? '0 18px 45px rgba(139,92,246,0.12), inset 0 0 0 1px rgba(255,255,255,0.35)'
            : '0 14px 36px rgba(15,23,42,0.08), inset 0 0 0 1px rgba(255,255,255,0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {isCurrent && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 2,
              padding: '0.38rem 0.7rem',
              borderRadius: 999,
              background: 'rgba(139,92,246,0.12)',
              color: '#8b5cf6',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.02em',
            }}
          >
            Active
          </div>
        )}

        <div
          style={{
            background: cardGradient,
            padding: '1.1rem 1.15rem 1rem',
            color: '#111827',
            borderBottom: '1px solid rgba(255,255,255,0.28)',
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#111827',
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: '1.7rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: '#111827',
                }}
              >
                {plan.price}
              </div>
            </div>

            {plan.badge && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 999,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  color: '#111827',
                  background: 'rgba(255,255,255,0.74)',
                  border: '1px solid rgba(255,255,255,0.55)',
                }}
              >
                {plan.badge}
              </span>
            )}
          </div>

          {plan.description && (
            <p
              style={{
                marginTop: '0.85rem',
                marginBottom: 0,
                fontSize: '0.94rem',
                lineHeight: 1.65,
                color: 'rgba(17,24,39,0.78)',
                maxWidth: '28rem',
              }}
            >
              {plan.description}
            </p>
          )}
        </div>

        <div
          style={{
            padding: '1.2rem 1.15rem 1rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {hasFeatures ? (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              {preview.map((label) => (
                <li
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.7rem',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 22,
                      height: 22,
                      minWidth: 22,
                      borderRadius: 999,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(126,142,241,.16)',
                      color: '#6b7cff',
                      marginTop: 1,
                    }}
                  >
                    <FiCheck size={14} />
                  </span>
                  <span
                    style={{
                      color: '#334155',
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div
              style={{
                color: '#64748b',
                fontSize: '0.94rem',
                lineHeight: 1.6,
              }}
            >
              No features listed for this plan yet.
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            {hiddenCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.42rem 0.72rem',
                  borderRadius: 999,
                  background: 'rgba(15,23,42,0.05)',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                +{hiddenCount} more
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            padding: '0 1.15rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={saving}
            style={{
              width: '100%',
              border: isCurrent
                ? '1px solid rgba(148,163,184,0.34)'
                : '1px solid transparent',
              background: isCurrent
                ? 'rgba(255,255,255,0.85)'
                : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: isCurrent ? '#475569' : '#fff',
              borderRadius: 16,
              minHeight: 48,
              padding: '0.9rem 1rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isCurrent
                ? 'none'
                : '0 12px 28px rgba(139,92,246,0.22)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <span>{actionLabel}</span>
            {!isCurrent && <FiZap size={16} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1060,
            }}
          >
            <div
              onClick={() => setOpen(false)}
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15,23,42,0.48)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.div
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
              style={{
                position: 'relative',
                zIndex: 2,
                width: 'min(92vw, 560px)',
                margin: '8vh auto 0',
                borderRadius: 28,
                overflow: 'hidden',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 30px 80px rgba(15,23,42,0.24)',
              }}
            >
              <div
                style={{
                  background: cardGradient,
                  padding: '1rem 1rem 0.95rem',
                  borderBottom: '1px solid rgba(255,255,255,0.28)',
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h5
                      id={titleId}
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        color: '#111827',
                      }}
                    >
                      {plan.name}
                    </h5>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#111827',
                      }}
                    >
                      {plan.price}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.48)',
                      background: 'rgba(255,255,255,0.74)',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiX size={16} />
                  </button>
                </div>

                {plan.badge && (
                  <div style={{ marginTop: '0.8rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.4rem 0.7rem',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.72)',
                        border: '1px solid rgba(255,255,255,0.55)',
                        color: '#111827',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.15rem 1rem 1rem' }}>
                {plan.description && (
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      marginBottom: '1rem',
                    }}
                  >
                    {plan.description}
                  </p>
                )}

                {hasFeatures && (
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem',
                    }}
                  >
                    {plan.features!.map((label) => (
                      <li
                        key={label}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.7rem',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 22,
                            height: 22,
                            minWidth: 22,
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(126,142,241,.16)',
                            color: '#6b7cff',
                            marginTop: 1,
                          }}
                        >
                          <FiCheck size={14} />
                        </span>
                        <span
                          style={{
                            color: '#334155',
                            fontSize: '0.94rem',
                            lineHeight: 1.6,
                          }}
                        >
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                style={{
                  padding: '0 1rem 1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    border: '1px solid rgba(148,163,184,0.32)',
                    background: '#fff',
                    color: '#475569',
                    borderRadius: 14,
                    minHeight: 44,
                    padding: '0.8rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={confirm}
                  disabled={saving || isCurrent}
                  style={{
                    border: '1px solid transparent',
                    background: isCurrent
                      ? 'rgba(148,163,184,0.18)'
                      : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    color: isCurrent ? '#64748b' : '#fff',
                    borderRadius: 14,
                    minHeight: 44,
                    padding: '0.8rem 1rem',
                    fontWeight: 700,
                    cursor: saving || isCurrent ? 'not-allowed' : 'pointer',
                    opacity: saving || isCurrent ? 0.8 : 1,
                  }}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openWarn && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1061,
            }}
          >
            <div
              onClick={() => setOpenWarn(false)}
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15,23,42,0.48)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.div
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 24 }}
              style={{
                position: 'relative',
                zIndex: 2,
                width: 'min(92vw, 520px)',
                margin: '10vh auto 0',
                borderRadius: 28,
                overflow: 'hidden',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98))',
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 30px 80px rgba(15,23,42,0.24)',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  background:
                    'linear-gradient(135deg, rgba(255,247,237,1), rgba(255,255,255,1))',
                  borderBottom: '1px solid rgba(15,23,42,0.06)',
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h5
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <FiAlertTriangle />
                      Create an account to continue
                    </h5>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenWarn(false)}
                    aria-label="Close"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: '1px solid rgba(15,23,42,0.08)',
                      background: '#fff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    marginBottom: '1rem',
                  }}
                >
                  You need an account to choose a plan and manage billing.
                </p>

                <div
                  style={{
                    padding: '0.95rem 1rem',
                    borderRadius: 18,
                    background: 'rgba(15,23,42,0.04)',
                    border: '1px solid rgba(15,23,42,0.06)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                      <div
                        style={{
                          color: '#111827',
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        {plan.name}
                      </div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.9rem',
                        }}
                      >
                        Selected membership
                      </div>
                    </div>
                    <div
                      style={{
                        color: '#111827',
                        fontWeight: 800,
                      }}
                    >
                      {plan.price}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0 1rem 1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenWarn(false)}
                  style={{
                    border: '1px solid rgba(148,163,184,0.32)',
                    background: '#fff',
                    color: '#475569',
                    borderRadius: 14,
                    minHeight: 44,
                    padding: '0.8rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleWarnContinue}
                  style={{
                    border: '1px solid transparent',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    color: '#fff',
                    borderRadius: 14,
                    minHeight: 44,
                    padding: '0.8rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Sign in / Create account</span>
                  <FiArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



{/*
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

*/}