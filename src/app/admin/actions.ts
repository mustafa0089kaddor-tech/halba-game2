'use server';
import { revalidatePath } from 'next/cache';
import { inferType, isAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

async function guard() { if (!(await isAdmin())) throw new Error('forbidden'); return supabaseAdmin(); }
const s = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const done = () => { revalidatePath('/admin'); revalidatePath('/categories'); revalidatePath('/'); };
const FLAGS = ['religious', 'film', 'character'];
const flagsOf = (f: FormData) => f.getAll('flags').map(String).filter((x) => FLAGS.includes(x));
const licenseOf = (f: FormData) => { const v = s(f, 'media_license'); return ['free', 'own', 'restricted'].includes(v) ? v : null; };

export async function saveCategory(f: FormData) {
  const db = await guard();
  const row = {
    slug: s(f, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, ''), name: s(f, 'name'), emoji: s(f, 'emoji') || '❓', color: s(f, 'color') || '#38B6D8',
    description: s(f, 'description') || null, premium: f.get('premium') === 'on', published: f.get('published') === 'on',
    sponsor_id: s(f, 'sponsor_id') || null, pack_id: s(f, 'pack_id') || null,
    group_key: s(f, 'group_key') || 'arabic', sort: Number(s(f, 'sort')) || 0,
  };
  if (!row.slug || !row.name) return;
  const id = s(f, 'id');
  if (id) await db.from('categories').update(row).eq('id', id); else await db.from('categories').insert(row);
  done();
}
export async function deleteCategory(f: FormData) { const db = await guard(); await db.from('categories').delete().eq('id', s(f, 'id')); done(); }

export async function saveQuestion(f: FormData) {
  const db = await guard();
  const points = Number(s(f, 'points'));
  const wrong = ['wrong1', 'wrong2', 'wrong3'].map((k) => s(f, k)).filter(Boolean);
  if (![200, 400, 600].includes(points) || !s(f, 'question') || !s(f, 'answer')) return;
  await db.from('questions').upsert({
    category_id: s(f, 'category_id'), points, type: s(f, 'media_url') && (s(f, 'type') || 'text') === 'text' ? inferType(s(f, 'media_url')) : (s(f, 'type') || 'text'), question: s(f, 'question'), answer: s(f, 'answer'),
    options: wrong.length === 3 ? [s(f, 'answer'), ...wrong] : null, source: s(f, 'source') || null, media_url: s(f, 'media_url') || null, media_credit: s(f, 'media_credit') || null, media_license: licenseOf(f), flags: flagsOf(f), source_url: s(f, 'source_url') || null,
    status: 'approved', active: true,
  }, { onConflict: 'category_id,question' });
  done();
}
/** يضيف/يغيّر/يزيل صورة أو فيديو لسؤال موجود. */
export async function setMedia(f: FormData) {
  const db = await guard();
  const url = s(f, 'media_url');
  const type = url ? (s(f, 'type') && s(f, 'type') !== 'text' ? s(f, 'type') : inferType(url)) : 'text';
  await db.from('questions').update({ type, media_url: url || null, media_credit: url ? s(f, 'media_credit') || null : null, media_license: url ? licenseOf(f) : null, flags: flagsOf(f), source_url: s(f, 'source_url') || null }).eq('id', s(f, 'id'));
  done();
}
export async function approveQuestion(f: FormData) { const db = await guard(); await db.from('questions').update({ status: 'approved' }).eq('id', s(f, 'id')); done(); }
export async function approveAll(f: FormData) { const db = await guard(); await db.from('questions').update({ status: 'approved' }).eq('category_id', s(f, 'category_id')).eq('status', 'draft'); done(); }
export async function deleteQuestion(f: FormData) { const db = await guard(); await db.from('questions').delete().eq('id', s(f, 'id')); done(); }
export async function resolveReport(f: FormData) { const db = await guard(); await db.from('feedback').delete().eq('id', s(f, 'id')); revalidatePath('/admin'); }

export async function saveSponsor(f: FormData) {
  const db = await guard();
  if (!s(f, 'name')) return;
  await db.from('sponsors').insert({ name: s(f, 'name'), logo_url: s(f, 'logo_url') || null, url: s(f, 'url') || null, blurb: s(f, 'blurb') || null });
  done();
}
export async function savePack(f: FormData) {
  const db = await guard();
  if (!s(f, 'name') || !s(f, 'slug')) return;
  await db.from('packs').insert({ slug: s(f, 'slug'), name: s(f, 'name'), description: s(f, 'description') || null, price_label: s(f, 'price_label') || null, stripe_price_id: s(f, 'stripe_price_id') || null });
  done(); revalidatePath('/pricing');
}
export async function saveOrg(f: FormData) {
  const db = await guard();
  const slug = s(f, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!slug || !s(f, 'name')) return;
  await db.from('orgs').insert({ slug, name: s(f, 'name'), logo_url: s(f, 'logo_url') || null, color: s(f, 'color') || null, contact_email: s(f, 'contact_email') || null });
  done();
}
