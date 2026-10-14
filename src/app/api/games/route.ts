import { NextResponse } from 'next/server';
import { getEntitlements, markSeen } from '@/lib/data';
import { FREE_DAILY, hasAdmin } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  if (!hasAdmin) return NextResponse.json({ allowed: true });
  const ent = await getEntitlements();
  if (!ent.userId) return NextResponse.json({ error: 'login' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string; teams?: string[]; cats?: string[]; scores?: number[]; seen?: string[] };
  const db = supabaseAdmin();

  if (body.action === 'start') {
    if (!ent.subscriber && !ent.isAdmin) {
      const since = new Date(); since.setUTCHours(0, 0, 0, 0);
      const { count } = await db.from('games').select('id', { count: 'exact', head: true }).eq('user_id', ent.userId).gte('started_at', since.toISOString());
      if ((count ?? 0) >= FREE_DAILY) return NextResponse.json({ allowed: false });
    }
    const { data } = await db.from('games').insert({ user_id: ent.userId, teams: (body.teams ?? []).slice(0, 2).map((t) => String(t).slice(0, 20)), categories: (body.cats ?? []).slice(0, 6) }).select('id').single();
    return NextResponse.json({ allowed: true, id: data?.id ?? null });
  }

  if (body.action === 'finish' && body.id && Array.isArray(body.scores) && body.scores.length === 2) {
    const [a, b] = body.scores.map((n) => Math.max(0, Math.min(100000, Number(n) || 0)));
    if (Array.isArray(body.seen)) await markSeen(ent.userId, body.seen.filter((x) => typeof x === 'string'));
    await db.from('games').update({ scores: [a, b], winner: a === b ? -1 : a > b ? 0 : 1, status: 'finished', finished_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', ent.userId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'bad request' }, { status: 400 });
}
