// app/billing/checkout/page.tsx
// app/billing/checkout/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

export default function BillingCheckout() {
  const search = useSearchParams();
  const [msg, setMsg] = useState('Preparing checkout…');
  const [err, setErr] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // not logged in → bounce to login but keep intent + plan
        const planId = search.get('planId') || localStorage.getItem('preselectedPlanId') || '';
        localStorage.setItem('checkoutIntent', '1');
        localStorage.setItem('skipQuestionnaireOnce', '1');
        window.location.href = `/login?planId=${encodeURIComponent(planId)}&intent=checkout`;
        return;
      }

      // Resolve planId to send; treat free/basic/null/none as "free" (no Stripe)
      const raw = search.get('planId') || localStorage.getItem('preselectedPlanId') || '';
      const normalized = (raw || '').trim().toLowerCase();
      const planIdToSend = (!raw || ['free','basic','null','none'].includes(normalized)) ? null : raw;

      try {
        setMsg('Starting checkout…');

        const res = await fetch(`${base}/api/payments/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            plan_id: planIdToSend,          // 👈 null triggers "free" branch on backend
            success_path: '/billing/success',
            cancel_path: '/'
          })
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const m = (json && (json.error || json.message)) || `Error ${res.status}`;
          throw new Error(m);
        }

        // Clear one-shot intent flags now that we’re acting on them
        localStorage.removeItem('checkoutIntent');
        localStorage.removeItem('skipQuestionnaireOnce');

        if (json.sessionId) {
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
          if (!stripe) throw new Error('Stripe failed to initialize.');
          const { error } = await stripe.redirectToCheckout({ sessionId: json.sessionId });
          if (error) throw error;
        } else if (json.url) {
          // (Your backend free branch returns a URL to success page)
          window.location.href = json.url;
        } else {
          throw new Error('Checkout session missing url/sessionId.');
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message);
        } else if (typeof e === 'string') {
          setErr(e);
        } else {
          setErr('Could not start checkout.');
        }
      }
    })();
  }, [base, search]);

  return (
    <div className="container py-5">
      <h2>Checkout</h2>
      {!err ? <p className="text-muted">{msg}</p> : <p className="text-danger">{err}</p>}
    </div>
  );
}
