'use strict';
// Ziyaret kaydı: gerçek tarayıcı trafiği (PV) — path, kaynak, cihaz, IP.
// Tekil ziyaretçi = IP+gün bazında ayrıştırma analitik sayfasında yapılır.
import { NextResponse } from 'next/server';
import { getDbAsync } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body.path || '/').slice(0, 120);
    const ref = String(body.ref || '').slice(0, 300);
    if (!path.startsWith('/')) return NextResponse.json({ ok: false });

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim().slice(0, 60) || 'local';
    const ua = (req.headers.get('user-agent') || '').slice(0, 250);
    const lang = (req.headers.get('accept-language') || '').slice(0, 60);

    const db = await getDbAsync();
    await db.collection('site_visits').insertOne({
      ts: new Date(),
      path,
      ref,
      ip,
      ua,
      lang,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
