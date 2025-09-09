// components/admin/messages/routes.ts
// app/api/messages/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // no static cache

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  // Prefer HttpOnly cookie; allow header bridge for localStorage development
  const cookieToken = req.cookies.get('admin_token')?.value || null;
  const headerAuth = req.headers.get('authorization'); // if you ever pass it
  const xAdminToken = req.headers.get('x-admin-token'); // our dev bridge

  const bearer =
    (headerAuth?.startsWith('Bearer ') ? headerAuth.slice(7) : headerAuth) ||
    xAdminToken ||
    cookieToken;

  if (!bearer) {
    return NextResponse.json(
      { error: 'Unauthorized: missing admin_token cookie or x-admin-token header' },
      { status: 401 }
    );
  }

  // forward querystring (?limit=..., etc.)
  const url = new URL(req.url);
  const qs = url.search;

  const upstream = await fetch(`${BASE}/api/messages/conversations${qs}`, {
    headers: { Authorization: `Bearer ${bearer}` },
    cache: 'no-store',
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
  });
}
