import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as auth from '../../../lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const jar = await headers();
  // nginx X-Forwarded-Proto/Host gönderir; yönlendirme https şemasıyla döner
  // (http Location, https sayfada fetch'i mixed-content nedeniyle patlatır).
  const proto = jar.get('x-forwarded-proto') || 'http';
  const host = jar.get('host') || 'hobbymice.com.tr';
  const base = `${proto}://${host}`;
  const ip = (jar.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (!auth.loginAllowed(ip)) {
    return NextResponse.redirect(new URL('/giris?hata=1', base), 303);
  }
  const form = await req.formData();
  const user = String(form.get('user') || '').trim();
  const password = String(form.get('password') || '');
  let geri = String(form.get('geri') || '/');
  if (!geri.startsWith('/') || geri.startsWith('//') || geri.includes('\\') || geri.includes('..')) geri = '/';

  const acc = await auth.verifyLogin(user, password);
  if (!acc) {
    auth.loginRecordFail(ip);
    return NextResponse.redirect(new URL('/giris?hata=1', base), 303);
  }
  const token = await auth.createSession(acc, { ip, ua: jar.get('user-agent') || '' });
  auth.audit(acc.playerName, 'login', acc.playerName, ip);
  const res = NextResponse.redirect(new URL(geri.startsWith('/admin') && !auth.isAdminAccount(acc) ? '/' : geri, base), 303);
  res.cookies.set(auth.SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: proto === 'https',
    maxAge: auth.SESSION_DAYS * 86400,
    path: '/',
  });
  return res;
}
