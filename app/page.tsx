// app/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/navbar/Nav';
import HomeCover from '@/components/cover/Home';
import MembershipCard, {
  type UIMembershipPlan,
} from '@/components/profile/memberships/MembershipCard';
import Testimonials from '@/components/misc/Testimonials';
import ServicesSection from '@/components/admin/about/ServicesSection';
import StatsSection from '@/components/admin/about/StatsSection';
import Teams from '@/components/admin/trainers/Teams';
import TrainerFooter from '@/components/admin/trainers/TrainerFooter';

type BackendPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

const formatPrice = (n: number) =>
  n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
  if (lower.includes('pro')) return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free')) {
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  }
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro')) return 'Most Popular';
  return undefined;
};

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);
  const router = useRouter();

  const [plans, setPlans] = useState<UIMembershipPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${base}/api/memberships/`);
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: BackendPlan[] = await res.json();

        const ui: UIMembershipPlan[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: formatPrice(p.price),
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          gradient: gradientFor(p.name),
          badge: badgeFor(p.name) ?? null,
        }));

        if (!cancelled) setPlans(ui);

        if (token) {
          const me = await fetch(`${base}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (me.status === 401) {
            if (!cancelled) setCurrentPlanId(null);
          } else if (me.ok) {
            const meJson = await me.json();
            if (!cancelled) {
              setCurrentPlanId(meJson.membership_plan_id ?? null);
            }
          }
        } else {
          setCurrentPlanId(null);
        }
      } catch {
        if (!cancelled) {
          setErr('Unable to load plans right now.');
          setPlans([
            {
              id: null,
              name: 'Free',
              price: '$0',
              description: 'Get started with the basics.',
              features: ['Basic logs', 'Workout plan viewer'],
              gradient: gradientFor('free'),
              badge: null,
            },
            {
              id: 'pro_2025',
              name: 'Pro',
              price: '$9/mo',
              description: 'Weekly plan + AI + analytics.',
              features: ['Workout library', 'AI generator', 'Analytics'],
              gradient: gradientFor('pro'),
              badge: 'Most Popular',
            },
            {
              id: 'elite_2025',
              name: 'Elite',
              price: '$19/mo',
              description: 'Everything in Pro plus 1:1 feedback.',
              features: ['Priority support', 'Form feedback'],
              gradient: gradientFor('elite'),
              badge: 'Best Value',
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [base, token]);

  async function handleSelect(plan: UIMembershipPlan) {
    if (!token) {
      localStorage.setItem('preselectedPlanId', plan.id ?? 'free');
      setNotice('Please create an account to choose a plan.');

      setTimeout(() => {
        router.push(`/login?planId=${encodeURIComponent(plan.id ?? 'free')}`);
      }, 800);

      return;
    }

    setSaving(true);
    setErr(null);

    try {
      const me = await fetch(`${base}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (me.status === 401) {
        localStorage.setItem('preselectedPlanId', plan.id ?? 'free');
        setNotice('Please create an account to choose a plan.');
        setSaving(false);

        setTimeout(() => {
          router.push(`/login?planId=${encodeURIComponent(plan.id ?? 'free')}`);
        }, 800);

        return;
      }

      if (!me.ok) throw new Error('Could not verify user.');
      const meJson = await me.json();

      const res = await fetch(`${base}/api/users/${encodeURIComponent(meJson.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ membership_plan_id: plan.id }),
      });

      const maybe = await res.json().catch(() => null);

      if (!res.ok) {
        const m =
          (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

      setCurrentPlanId(plan.id ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="home-page">
      <Nav />

      <main className="home-main">
        <HomeCover />

        <ServicesSection />
        <Teams />

        <section
          style={{
            width: '100%',
            padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
            background:
              'linear-gradient(180deg, #ffffff 0%, #f8fafc 45%, #f3f4f6 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-60px',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.08)',
              filter: 'blur(48px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: isDesktop ? '90px' : '-40px',
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(91,209,215,0.10)',
              filter: 'blur(45px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              maxWidth: '1240px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              className="text-center"
              style={{
                maxWidth: '760px',
                margin: '0 auto 3.5rem auto',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  background: 'rgba(139,92,246,0.10)',
                  color: '#8b5cf6',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                Membership Plans
              </span>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Choose the plan that fits your goals
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                }}
              >
                Start simple or unlock more advanced coaching, structure, and
                support as your fitness journey grows.
              </p>
            </div>

            {(notice || err) && (
              <div
                style={{
                  maxWidth: '980px',
                  margin: '0 auto 1.5rem auto',
                  display: 'grid',
                  gap: '0.85rem',
                }}
              >
                {notice && (
                  <div
                    style={{
                      padding: '1rem 1.1rem',
                      borderRadius: 18,
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.12)',
                      color: '#1d4ed8',
                      fontWeight: 600,
                    }}
                  >
                    {notice}
                  </div>
                )}

                {err && (
                  <div
                    style={{
                      padding: '1rem 1.1rem',
                      borderRadius: 18,
                      background: 'rgba(245,158,11,0.10)',
                      border: '1px solid rgba(245,158,11,0.14)',
                      color: '#92400e',
                      fontWeight: 600,
                    }}
                  >
                    {err}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                borderRadius: 32,
                padding: isDesktop ? '2rem' : '1.1rem',
                background: 'rgba(255,255,255,0.62)',
                border: '1px solid rgba(139,92,246,0.08)',
                boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {loading ? (
                <div
                  style={{
                    minHeight: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Loading plans…
                </div>
              ) : (
                <div className="row g-4">
                  {plans.map((plan) => {
                    const isCurrent = token ? currentPlanId === plan.id : false;

                    return (
                      <div className="col-12 col-md-6 col-xl-4" key={`${plan.id ?? 'free'}`}>
                        <MembershipCard
                          plan={plan}
                          isCurrent={isCurrent}
                          saving={saving}
                          previewCount={4}
                          onSelect={() => handleSelect(plan)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <Testimonials />
        <StatsSection />
        <TrainerFooter />
      </main>
    </div>
  );
}


{/*
// app/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/navbar/Nav';
import HomeCover from '@/components/cover/Home';
import MembershipCard, {
  type UIMembershipPlan,
} from '@/components/profile/memberships/MembershipCard';
import Testimonials from '@/components/misc/Testimonials';
import ServicesSection from '@/components/admin/about/ServicesSection';
import StatsSection from '@/components/admin/about/StatsSection';
import Teams from '@/components/admin/trainers/Teams';
import TrainerFooter from '@/components/admin/trainers/TrainerFooter';

type BackendPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

const formatPrice = (n: number) =>
  n === 0 ? '$0' : `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}/mo`;

const gradientFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'linear-gradient(135deg, #FF9770, #FFD670)';
  if (lower.includes('pro')) return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free')) {
    return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  }
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro')) return 'Most Popular';
  return undefined;
};

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);
  const router = useRouter();

  const [plans, setPlans] = useState<UIMembershipPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${base}/api/memberships/`);
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: BackendPlan[] = await res.json();

        const ui: UIMembershipPlan[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: formatPrice(p.price),
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          gradient: gradientFor(p.name),
          badge: badgeFor(p.name) ?? null,
        }));

        if (!cancelled) setPlans(ui);

        if (token) {
          const me = await fetch(`${base}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (me.status === 401) {
            if (!cancelled) setCurrentPlanId(null);
          } else if (me.ok) {
            const meJson = await me.json();
            if (!cancelled) {
              setCurrentPlanId(meJson.membership_plan_id ?? null);
            }
          }
        } else {
          setCurrentPlanId(null);
        }
      } catch {
        if (!cancelled) {
          setErr('Unable to load plans right now.');
          setPlans([
            {
              id: null,
              name: 'Free',
              price: '$0',
              description: 'Get started with the basics.',
              features: ['Basic logs', 'Workout plan viewer'],
              gradient: gradientFor('free'),
              badge: null,
            },
            {
              id: 'pro_2025',
              name: 'Pro',
              price: '$9/mo',
              description: 'Weekly plan + AI + analytics.',
              features: ['Workout library', 'AI generator', 'Analytics'],
              gradient: gradientFor('pro'),
              badge: 'Most Popular',
            },
            {
              id: 'elite_2025',
              name: 'Elite',
              price: '$19/mo',
              description: 'Everything in Pro plus 1:1 feedback.',
              features: ['Priority support', 'Form feedback'],
              gradient: gradientFor('elite'),
              badge: 'Best Value',
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [base, token]);

  async function handleSelect(plan: UIMembershipPlan) {
    if (!token) {
      localStorage.setItem('preselectedPlanId', plan.id ?? 'free');
      setNotice('Please create an account to choose a plan.');

      setTimeout(() => {
        router.push(`/login?planId=${encodeURIComponent(plan.id ?? 'free')}`);
      }, 800);

      return;
    }

    setSaving(true);
    setErr(null);

    try {
      const me = await fetch(`${base}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (me.status === 401) {
        localStorage.setItem('preselectedPlanId', plan.id ?? 'free');
        setNotice('Please create an account to choose a plan.');
        setSaving(false);

        setTimeout(() => {
          router.push(`/login?planId=${encodeURIComponent(plan.id ?? 'free')}`);
        }, 800);

        return;
      }

      if (!me.ok) throw new Error('Could not verify user.');
      const meJson = await me.json();

      const res = await fetch(`${base}/api/users/${encodeURIComponent(meJson.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ membership_plan_id: plan.id }),
      });

      const maybe = await res.json().catch(() => null);

      if (!res.ok) {
        const m =
          (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
        throw new Error(m);
      }

      setCurrentPlanId(plan.id ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="home-page">
      <Nav />

      <main className="home-main">
        <HomeCover />

        <ServicesSection />
       
        <Teams />
        
        <div className="container">
          {notice && <div className="alert alert-info py-2 mt-3">{notice}</div>}
          {err && <div className="alert alert-warning py-2 mt-2">{err}</div>}
        </div>

        <section className="container py-5">
          <div className="text-center mb-4">
            <h1 className="mb-1">Choose Your Plan</h1>
            <p className="text-muted">Upgrade anytime. Cancel anytime.</p>
          </div>

          {loading ? (
            <div className="text-center text-muted">Loading plans…</div>
          ) : (
            <div className="row g-3 mt-5">
              {plans.map((plan) => {
                const isCurrent = token ? currentPlanId === plan.id : false;

                return (
                  <div className="col-md-4 mt-5" key={`${plan.id ?? 'free'}`}>
                    <MembershipCard
                      plan={plan}
                      isCurrent={isCurrent}
                      saving={saving}
                      previewCount={4}
                      onSelect={() => handleSelect(plan)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Testimonials />
        <StatsSection />
        <TrainerFooter />
      </main>
    </div>
  );
}




*/}