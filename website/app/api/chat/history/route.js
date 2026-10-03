import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import * as auth from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const user = await auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Giriş yapmalısın.' }, { status: 401 });
  const withWho = String(new URL(req.url).searchParams.get('with') || '').slice(0, 40);
  if (!withWho) return NextResponse.json({ ok: true, messages: [] });
  const msgs = await getDb().collection('chat_messages').find({
    $or: [
      { from: user.playerName, to: withWho },
      { from: withWho, to: user.playerName },
    ],
  }).sort({ ts: -1 }).limit(50).toArray();
  return NextResponse.json({
    ok: true,
    messages: msgs.reverse().map(m => ({ from: m.from, body: m.body, ts: m.ts })),
  });
}
