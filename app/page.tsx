// app/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from "@/components/navbar/Nav";
import HomeCover from "@/components/cover/Home";
import MembershipCard, { type UIMembershipPlan } from "@/components/profile/memberships/MembershipCard";
import Testimonials from "@/components/misc/Testimonials";
import ServicesSection from "@/components/admin/about/ServicesSection";
import StatsSection from '@/components/admin/about/StatsSection';
import Teams from "@/components/admin/trainers/Teams";
import Footer from "@/components/misc/Footer";

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
  if (lower.includes('pro'))   return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free'))  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro'))   return 'Most Popular';
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

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
            if (!cancelled) setCurrentPlanId(meJson.membership_plan_id ?? null);
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
    return () => { cancelled = true; };
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
        const m = (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
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
    <div className="layout">
      <Nav />
      <main>
        <HomeCover />

        <ServicesSection />

        {/* ✅ Teams section */}
        <Teams />

        <div className="container">
          {notice && <div className="alert alert-info py-2 mt-3">{notice}</div>}
          {err && <div className="alert alert-warning py-2 mt-2">{err}</div>}
        </div>

        {/* ✅ Membership plans */}
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
      </main>
      <Footer />
    </div>
  );
}



/*
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Nav from "@/components/navbar/Nav";
import HomeCover from "@/components/cover/Home";
import Footer from "@/components/misc/Footer";

import MembershipCard, { type UIMembershipPlan } from "@/components/profile/memberships/MembershipCard";
//import FeatureCards from "@/components/misc/FeatureCards";
import Testimonials from "@/components/misc/Testimonials";
import ServicesSection from "@/components/admin/about/ServicesSection";
import StatsSection from '@/components/admin/about/StatsSection';

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
  if (lower.includes('pro'))   return 'linear-gradient(135deg, #7E8EF1, #5BD1D7)';
  if (lower.includes('free'))  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
  return 'linear-gradient(135deg, rgba(126,142,241,.2), rgba(91,209,215,.2))';
};

const badgeFor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elite')) return 'Best Value';
  if (lower.includes('pro'))   return 'Most Popular';
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

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
            if (!cancelled) setCurrentPlanId(meJson.membership_plan_id ?? null);
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
    return () => { cancelled = true; };
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
        const m = (maybe && (maybe.error || maybe.message)) || `Error ${res.status}`;
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
    <div className="layout">
      <Nav />
      <main>
        <HomeCover />

         <ServicesSection />

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
      </main>
      <Footer />
    </div>
  );
}









*/