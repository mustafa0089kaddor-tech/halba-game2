import { NextResponse } from 'next/server';
import { inferType, isAdmin, parseCsv } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

const TYPES = ['text', 'image', 'audio', 'video'];
const FLAGS = ['religious', 'film', 'character'];

/** الأعمدة: category_slug,points(200|400|600),type,question,answer,wrong1,wrong2,wrong3,source,media_url,status — الحالة الافتراضية draft */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const rows = parseCsv(await req.text());
  if (rows.length < 2) return NextResponse.json({ error: 'الملف فارغ أو بلا صفوف بيانات.' }, { status: 400 });
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (n: string) => head.indexOf(n);
  for (const need of ['category_slug', 'points', 'question', 'answer']) {
    if (col(need) < 0) return NextResponse.json({ error: `العمود المطلوب مفقود: ${need}` }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data: cats } = await db.from('categories').select('id,slug');
  const bySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));
  const errors: string[] = [];
  const out: Record<string, unknown>[] = [];
  rows.slice(1).forEach((r, i) => {
    const line = i + 2, g = (n: string) => (col(n) >= 0 ? (r[col(n)] ?? '').trim() : '');
    const cid = bySlug.get(g('category_slug')); const points = Number(g('points')); let type = g('type') || 'text'; if (type === 'text' && g('media_url')) type = inferType(g('media_url'));
    if (!cid) return void errors.push(`سطر ${line}: فئة غير موجودة «${g('category_slug')}»`);
    if (![200, 400, 600].includes(points)) return void errors.push(`سطر ${line}: النقاط يجب أن تكون 200 أو 400 أو 600`);
    if (!TYPES.includes(type)) return void errors.push(`سطر ${line}: نوع غير صالح «${type}»`);
    if (!g('question') || !g('answer')) return void errors.push(`سطر ${line}: السؤال أو الإجابة فارغ`);
    const wrong = ['wrong1', 'wrong2', 'wrong3'].map(g).filter(Boolean);
    out.push({ category_id: cid, points, type, question: g('question'), answer: g('answer'), options: wrong.length === 3 ? [g('answer'), ...wrong] : null, source: g('source') || null, media_url: g('media_url') || null, media_credit: g('media_credit') || null, source_url: g('source_url') || null, flags: g('flags') ? g('flags').split('|').map((x) => x.trim()).filter((x) => FLAGS.includes(x)) : [], media_license: ['free', 'own', 'restricted'].includes(g('media_license')) ? g('media_license') : null, status: g('status') === 'approved' ? 'approved' : 'draft' });
  });
  let imported = 0;
  if (out.length) {
    // الأسئلة المكررة (نفس النص في نفس الفئة) تُتجاهل
    const { data, error } = await db.from('questions').upsert(out, { onConflict: 'category_id,question', ignoreDuplicates: true }).select('id');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    imported = data?.length ?? 0;
    if (imported < out.length) errors.push(`تم تجاهل ${out.length - imported} سؤالاً مكرراً`);
  }
  return NextResponse.json({ imported, errors });
}
