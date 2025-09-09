// /lib/adminApi.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;

  const keys = ['adminToken', 'admin_token', 'token', 'authToken'];
  for (const k of keys) {
    const fromLocal = localStorage.getItem(k);
    if (fromLocal) {
      console.log(`[adminApi] Using token from localStorage key "${k}"`);
      return fromLocal;
    }
  }
  // also try sessionStorage (some apps use it for admin area)
  if (typeof sessionStorage !== 'undefined') {
    for (const k of keys) {
      const fromSession = sessionStorage.getItem(k);
      if (fromSession) {
        console.log(`[adminApi] Using token from sessionStorage key "${k}"`);
        return fromSession;
      }
    }
  }
  console.warn('[adminApi] No admin token found in storage');
  return null;
}

/**
 * Minimal admin API helper:
 * - Reads token via getAdminToken()
 * - NEVER redirects
 * - Throws with e.status so callers can render a message (401, etc.)
 */
export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text().catch(() => '');

  if (!res.ok) {
    const err = new Error(text || `${res.status} ${res.statusText}`) as Error & { status?: number; body?: string };
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return text ? (JSON.parse(text) as T) : (undefined as T);
}

