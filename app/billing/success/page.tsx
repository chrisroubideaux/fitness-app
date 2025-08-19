// app/billing/success/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function BillingSuccess() {
  const search = useSearchParams();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [msg, setMsg] = useState('Finalizing your membership…');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sessionId = search.get('session_id');
      const planIdQS = search.get('planId') || search.get('plan_id');
      const planIdLS = typeof window !== 'undefined' ? localStorage.getItem('preselectedPlanId') : null;
      const planId = planIdQS || planIdLS || '';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      try {
        // --- Case A: Stripe session present -> confirm with backend ---
        if (sessionId) {
          const url = new URL(`${base}/api/payments/confirm`);
          url.searchParams.set('session_id', sessionId);
          if (planId) url.searchParams.set('plan_id', planId);

          const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const json = await res.json().catch(() => null);
          if (!res.ok) throw new Error((json && (json.error || json.message)) || `Error ${res.status}`);

          setMsg('All set! Redirecting…');
          try { localStorage.removeItem('preselectedPlanId'); } catch {}

          const userId = json?.user_id;
          setTimeout(() => {
            router.replace(`/profile/${encodeURIComponent(userId || 'me')}?from=checkout`);
          }, 800);
          return;
        }

        // --- Case B: Free path (no session_id) -> set plan client-side ---
        if (!sessionId && planId.toLowerCase() === 'free') {
          if (!token) {
            // Not logged in → send to login carrying planId so we can apply after login
            setMsg('Please log in to finish setting your plan.');
            setTimeout(() => {
              router.replace(`/login?planId=${encodeURIComponent('free')}`);
            }, 700);
            return;
          }

          // We are logged in: set membership_plan_id = null
          const meRes = await fetch(`${base}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const meJson = await meRes.json().catch(() => null);
          if (!meRes.ok) throw new Error((meJson && (meJson.error || meJson.message)) || `Error ${meRes.status}`);

          const userId = meJson?.id;
          const putRes = await fetch(`${base}/api/users/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ membership_plan_id: null }),
          });
          const putJson = await putRes.json().catch(() => null);
          if (!putRes.ok) throw new Error((putJson && (putJson.error || putJson.message)) || `Error ${putRes.status}`);

          setMsg('Free plan set! Redirecting…');
          try { localStorage.removeItem('preselectedPlanId'); } catch {}
          setTimeout(() => {
            router.replace(`/profile/${encodeURIComponent(userId || 'me')}?from=checkout`);
          }, 800);
          return;
        }

        // If we’re here with no session & no free plan, we’re missing context.
        throw new Error('Missing Stripe session information.');
      } catch (e: unknown) {
        setErr(e instanceof Error ? (e.message || 'Could not finalize membership.') : 'Could not finalize membership.');
      }
    })();
    
  }, []);

  return (
    <div className="container py-5">
      <h2>Payment Success</h2>
      {!err ? <p className="text-muted">{msg}</p> : <p className="text-danger">{err}</p>}
    </div>
  );
}
