import { NextResponse } from 'next/server';
import * as auth from '../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await auth.getUser();
  return NextResponse.json(user
    ? { ok: true, playerName: user.playerName, staff: user.staff, roles: user.roles }
    : { ok: false });
}
