import { NextResponse } from 'next/server';
import { hasAdmin } from '@/lib/env';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { questionId?: string; kind?: string; reason?: string };
  if (!b.questionId || !['report', 'up', 'down'].includes(b.kind ?? '')) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  if (!hasAdmin || !UUID.test(b.questionId)) return NextResponse.json({ ok: true }); // الأسئلة المحلية التجريبية: لا حفظ
  const { data: { user } } = await supabaseServer().auth.getUser();
  await supabaseAdmin().from('feedback').insert({ question_id: b.questionId, kind: b.kind, reason: b.reason?.slice(0, 200) ?? null, user_id: user?.id ?? null });
  return NextResponse.json({ ok: true });
}
