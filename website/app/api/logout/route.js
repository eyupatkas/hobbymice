import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as auth from '../../../lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const jar = await headers();
  // Yönlendirme https şemasıyla dönsün (bkz. login route açıklaması).
  const proto = jar.get('x-forwarded-proto') || 'http';
  const host = jar.get('host') || 'hobbymice.com.tr';
  const token = jar.get('cookie')
    ? (jar.get('cookie').split(';').map(s => s.trim()).find(s => s.startsWith(auth.SESSION_COOKIE + '=')) || '').split('=')[1]
    : null;
  if (token) await auth.destroySession(token);
  const res = NextResponse.redirect(new URL('/', `${proto}://${host}`), 303);
  res.cookies.set(auth.SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
