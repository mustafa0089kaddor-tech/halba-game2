import 'server-only';
import { BANK, type BankQuestion } from '@/data/bank';
import { CATALOG } from '@/data/catalog';
import { hasAdmin } from '@/lib/env';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import type { Category, Entitlements, Question, Sponsor } from '@/lib/types';

export const GUEST: Entitlements = { userId: null, subscriber: false, packs: [], isAdmin: false };
const TIERS = [200, 400, 600] as const;
const MIN_PER_TIER = 2;

export async function getEntitlements(): Promise<Entitlements> {
  if (!hasAdmin) return GUEST;
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return GUEST;
  const db = supabaseAdmin();
  const [subs, packs, profile] = await Promise.all([
    db.from('subscriptions').select('status,current_period_end').eq('user_id', user.id),
    db.from('purchases').select('pack_id').eq('user_id', user.id),
    db.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ]);
  const now = Date.now();
  const subscriber = (subs.data ?? []).some(
    (s) => ['active', 'trialing'].includes(s.status) && (!s.current_period_end || new Date(s.current_period_end).getTime() > now - 86400000),
  );
  return { userId: user.id, subscriber, packs: (packs.data ?? []).map((p) => p.pack_id), isAdmin: profile.data?.role === 'admin' };
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** الفئات مع حجم بنكها وحالة القفل. لا تحتوي أسئلة. */
export async function getCategories(ent: Entitlements): Promise<Category[]> {
  if (!hasAdmin) {
    return CATALOG.map((c) => {
      const counts = { 200: 0, 400: 0, 600: 0 } as Category['counts'];
      BANK.filter((q) => q.cat === c.slug).forEach((q) => counts[q.points]++);
      return { id: c.slug, slug: c.slug, name: c.name, emoji: c.emoji, color: c.color, description: c.description, group: c.group, premium: false, locked: false, sponsor: null, counts, playable: TIERS.every((t) => counts[t] >= MIN_PER_TIER), questions: [] };
    });
  }
  const db = supabaseAdmin();
  const [{ data: cats }, { data: stats }] = await Promise.all([
    db.from('categories').select('*, sponsor:sponsors(id,name,logo_url,url,blurb)').eq('published', true).order('sort').order('created_at'),
    db.from('category_stats').select('*'),
  ]);
  const st = new Map((stats ?? []).map((s) => [s.category_id, s]));
  const open = (c: { premium: boolean; pack_id: string | null }) =>
    ent.subscriber || ent.isAdmin ? (c.pack_id ? ent.packs.includes(c.pack_id) || ent.isAdmin : true) : !c.premium && !c.pack_id;
  return (cats ?? []).map((c) => {
    const s = st.get(c.id);
    const counts = { 200: s?.c200 ?? 0, 400: s?.c400 ?? 0, 600: s?.c600 ?? 0 } as Category['counts'];
    return {
      id: c.id, slug: c.slug, name: c.name, emoji: c.emoji, color: c.color, description: c.description, group: c.group_key,
      premium: c.premium, pack_id: c.pack_id, locked: !open(c), sponsor: (c.sponsor as Sponsor | null) ?? null,
      counts, playable: TIERS.every((t) => counts[t] >= MIN_PER_TIER), questions: [],
    };
  });
}

/** يحوّل سؤال البنك المحلي إلى شكل السؤال الموحّد الذي تستخدمه اللعبة (نفس شكل جدول questions في Supabase). */
function fromBank(q: BankQuestion): Question {
  return {
    id: q.id,
    category_id: q.cat,
    points: q.points,
    slot: 0,
    type: q.type,
    question: q.question,
    answer: q.answer,
    options: q.options,
    source: q.source,
    media_url: q.type === 'image' ? q.imageUrl : q.type === 'video' ? q.videoUrl : null,
    media_credit: q.type === 'text' ? null : (q.mediaCredit ?? null),
    media_license: q.type === 'text' ? null : q.mediaLicense,
    flags: q.flags,
    source_url: q.sourceUrl,
  };
}

/**
 * يسحب لوحة اللعب: ٢ سؤال من كل مستوى (٢٠٠/٤٠٠/٦٠٠) لكل فئة مختارة.
 * يفضّل الأسئلة التي لم يرها اللاعب، ولا يعيد المرئية إلا عند نفاد غير المرئية في ذلك المستوى.
 */
export async function drawBoard(ent: Entitlements, catIds: string[], seenIds: string[]): Promise<Category[]> {
  const cats = (await getCategories(ent)).filter((c) => catIds.includes(c.id));
  if (cats.length !== catIds.length || cats.some((c) => c.locked || !c.playable)) return [];
  const seen = new Set(seenIds);
  let pool: Question[];
  if (!hasAdmin) {
    pool = BANK.filter((q) => catIds.includes(q.cat)).map(fromBank);
  } else {
    const db = supabaseAdmin();
    const { data } = await db.from('questions').select('id,category_id,points,type,question,answer,options,source,media_url,media_credit,media_license,flags,source_url').in('category_id', catIds).eq('active', true).eq('status', 'approved');
    pool = (data ?? []).map((q) => ({ ...q, slot: 0 })) as Question[];
    if (ent.userId) {
      const { data: s } = await db.from('seen_questions').select('question_id').eq('user_id', ent.userId).order('seen_at', { ascending: false }).limit(4000);
      (s ?? []).forEach((x) => seen.add(x.question_id));
    }
  }
  return cats.map((c) => {
    const mine = pool.filter((q) => q.category_id === c.id);
    const questions: Question[] = [];
    TIERS.forEach((t, ti) => {
      const tier = shuffle(mine.filter((q) => q.points === t));
      [...tier.filter((q) => !seen.has(q.id)), ...tier.filter((q) => seen.has(q.id))].slice(0, MIN_PER_TIER).forEach((q, i) => questions.push({ ...q, slot: ti * 2 + i }));
    });
    return { ...c, questions };
  });
}

export async function markSeen(userId: string, ids: string[]) {
  if (!hasAdmin || !ids.length) return;
  const rows = ids.filter((i) => /^[0-9a-f-]{36}$/i.test(i)).slice(0, 60).map((question_id) => ({ user_id: userId, question_id, seen_at: new Date().toISOString() }));
  if (rows.length) await supabaseAdmin().from('seen_questions').upsert(rows, { onConflict: 'user_id,question_id' });
}

export async function getTeasers(cat: Category): Promise<string[]> {
  if (cat.locked || cat.premium || !cat.playable) return [];
  if (!hasAdmin) return BANK.filter((q) => q.cat === cat.slug && q.points === 200).map((q) => q.question);
  const { data } = await supabaseAdmin().from('questions').select('question').eq('category_id', cat.id).eq('points', 200).eq('active', true).eq('status', 'approved').limit(2);
  return (data ?? []).map((q) => q.question);
}

export async function getSponsors(): Promise<Sponsor[]> {
  if (!hasAdmin) return [];
  const { data } = await supabaseAdmin().from('sponsors').select('id,name,logo_url,url,blurb').eq('active', true);
  return data ?? [];
}

export async function getPacks() {
  if (!hasAdmin) return [] as { id: string; name: string; description: string | null; price_label: string | null }[];
  const { data } = await supabaseAdmin().from('packs').select('id,name,description,price_label').eq('active', true);
  return data ?? [];
}

export async function getOrg(slug: string) {
  if (!hasAdmin) return null;
  const { data } = await supabaseAdmin().from('orgs').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  return data;
}
