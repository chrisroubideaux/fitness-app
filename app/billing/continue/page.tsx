// app/billing/continue/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BillingContinue() {
  const router = useRouter();
  const search = useSearchParams();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = search.get('token') || localStorage.getItem('authToken') || '';
      const planId = search.get('planId') || localStorage.getItem('preselectedPlanId') || '';

      if (!token) {
        // go back to login preserving intent
        router.replace(`/login?planId=${encodeURIComponent(planId)}&from=plan`);
        return;
      }

      // store token for follow-up calls
      localStorage.setItem('authToken', token);
      // prevent questionnaire popping after OAuth
      localStorage.setItem('skipQuestionnaireOnce', '1');
      if (planId) localStorage.setItem('preselectedPlanId', planId);

      try {
        const res = await fetch(`${base}/api/payments/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: planId || null,
            success_path: '/billing/success',
            cancel_path: '/',
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const m = (json && (json.error || json.message)) || `Error ${res.status}`;
          throw new Error(m);
        }

        if (json.sessionId) {
          // use Stripe.js redirect if you want; or fall back to URL
          // To keep this page simple, if you only return url, just set location:
          // But your backend returns sessionId, so redirect via Stripe is ideal.
          // We'll just use URL fallback if provided to avoid adding Stripe to this page.
        }

        if (json.url) {
          window.location.href = json.url;
          return;
        }

        // If only sessionId returned, go via Stripe.js (optional):
        // import { loadStripe } from '@stripe/stripe-js' at top if you prefer that flow.

        setErr('No redirect info from server.');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Unable to start checkout.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-5">
      <h2>Preparing checkout…</h2>
      {!err ? <p className="text-muted">Redirecting you to Stripe…</p> : <p className="text-danger">{err}</p>}
    </div>
  );
}
