import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImportForm from './ImportForm';
import MediaField from './MediaField';
import MetaFields from './MetaFields';
import { approveAll, approveQuestion, setMedia, deleteCategory, deleteQuestion, resolveReport, saveCategory, saveOrg, savePack, saveQuestion, saveSponsor } from './actions';
import { GROUPS } from '@/data/catalog';
import { isAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'لوحة التحكم', robots: { index: false } };
export const dynamic = 'force-dynamic';

const TABS = [['stats', 'الإحصائيات'], ['categories', 'الفئات'], ['questions', 'الأسئلة'], ['reports', 'البلاغات'], ['import', 'استيراد CSV'], ['business', 'الرعاة والباقات']] as const;
const TARGET = 24; // الهدف: ٨ أسئلة معتمدة على الأقل لكل مستوى، أي ٣ ألعاب كاملة دون تكرار
const money = (rows: { amount: number; currency: string }[]) => {
  const by: Record<string, number> = {};
  rows.forEach((r) => (by[r.currency] = (by[r.currency] ?? 0) + r.amount));
  return Object.entries(by).map(([c, a]) => `${(a / 100).toLocaleString('ar-EG')} ${c.toUpperCase()}`).join(' + ') || '٠';
};

export default async function Admin({ searchParams }: { searchParams: { tab?: string; cat?: string; g?: string } }) {
  if (!(await isAdmin())) notFound();
  const tab = searchParams.tab ?? 'stats';
  const db = supabaseAdmin();
  const [{ data: cats }, { data: sponsors }, { data: packs }] = await Promise.all([
    db.from('categories').select('*').order('created_at'), db.from('sponsors').select('id,name'), db.from('packs').select('id,name'),
  ]);

  return (
    <div className="pt-4">
      <h1 className="mb-4 font-display text-4xl text-saffron">لوحة التحكم</h1>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="أقسام اللوحة">
        {TABS.map(([k, l]) => <Link key={k} href={`/admin?tab=${k}`} className={`btn !px-4 !py-2 text-sm ${tab === k ? 'btn-primary' : 'btn-ghost'}`}>{l}</Link>)}
      </nav>

      {tab === 'stats' && await (async () => {
        const wk = new Date(Date.now() - 7 * 864e5).toISOString(), mo = new Date(Date.now() - 30 * 864e5).toISOString();
        const [u, g, g7, sb, rp, pay, pay30, qa, qd] = await Promise.all([
          db.from('profiles').select('id', { count: 'exact', head: true }),
          db.from('games').select('id', { count: 'exact', head: true }).eq('status', 'finished'),
          db.from('games').select('id', { count: 'exact', head: true }).gte('started_at', wk),
          db.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
          db.from('feedback').select('id', { count: 'exact', head: true }).eq('kind', 'report'),
          db.from('payments').select('amount,currency'), db.from('payments').select('amount,currency').gte('created_at', mo),
          db.from('questions').select('id', { count: 'exact', head: true }).eq('status', 'approved'), db.from('questions').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        ]);
        const n = (x: number | null) => (x ?? 0).toLocaleString('ar-EG');
        const cards: [string, string][] = [['المستخدمون', n(u.count)], ['ألعاب مكتملة', n(g.count)], ['ألعاب آخر ٧ أيام (مسجّلون)', n(g7.count)], ['اشتراكات نشطة', n(sb.count)], ['بلاغات مفتوحة', n(rp.count)], ['أسئلة معتمدة', n(qa.count)], ['مسودات للمراجعة', n(qd.count)], ['الإيراد الكلي', money(pay.data ?? [])], ['إيراد آخر ٣٠ يوماً', money(pay30.data ?? [])]];
        return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{cards.map(([l, v]) => <div key={l} className="card"><p className="text-sm text-paper/70">{l}</p><p className="mt-1 font-display text-3xl">{v}</p></div>)}</div>;
      })()}

      {tab === 'categories' && await (async () => {
        const g = searchParams.g ?? GROUPS[0].key;
        const list = (cats ?? []).filter((c) => c.group_key === g);
        return (
          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-2">{GROUPS.map((x) => <Link key={x.key} href={`/admin?tab=categories&g=${x.key}`} className={`btn !px-3 !py-1.5 text-sm ${g === x.key ? 'btn-primary' : 'btn-ghost'}`}>{x.emoji} {x.name}</Link>)}</nav>
            {[...list, null].map((c) => (
              <details key={c?.id ?? 'new'} className="card" open={!c && list.length === 0}>
                <summary className="cursor-pointer font-bold">{c ? `${c.emoji} ${c.name}` : '＋ فئة جديدة في هذا المحور'}</summary>
                <form action={saveCategory} className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c && <input type="hidden" name="id" value={c.id} />}
                  <input className="input" name="name" placeholder="الاسم" defaultValue={c?.name} required />
                  <input className="input" dir="ltr" name="slug" placeholder="slug-en" defaultValue={c?.slug} required />
                  <input className="input" name="emoji" placeholder="إيموجي" defaultValue={c?.emoji} />
                  <input className="input" dir="ltr" name="color" placeholder="#38B6D8" defaultValue={c?.color} />
                  <select className="input" name="group_key" defaultValue={c?.group_key ?? g}>{GROUPS.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select>
                  <input className="input" type="number" name="sort" placeholder="الترتيب" defaultValue={c?.sort ?? 0} />
                  <textarea className="input sm:col-span-2" name="description" placeholder="وصف قصير (يظهر في صفحة الفئة وSEO)" defaultValue={c?.description ?? ''} />
                  <select className="input" name="sponsor_id" defaultValue={c?.sponsor_id ?? ''}><option value="">بلا راعٍ</option>{sponsors?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <select className="input" name="pack_id" defaultValue={c?.pack_id ?? ''}><option value="">ليست ضمن باقة</option>{packs?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <label className="flex items-center gap-2"><input type="checkbox" name="premium" defaultChecked={c?.premium} /> حصرية للمشتركين</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={c?.published ?? true} /> منشورة</label>
                  <button className="btn btn-primary sm:col-span-2">حفظ</button>
                </form>
                {c && <form action={deleteCategory} className="mt-2"><input type="hidden" name="id" value={c.id} /><button className="text-sm text-rose underline">حذف الفئة وكل أسئلتها</button></form>}
                {c && <Link href={`/admin?tab=questions&cat=${c.slug}`} className="mt-2 block text-sm text-saffron underline">أسئلة هذه الفئة</Link>}
              </details>
            ))}
          </div>
        );
      })()}

      {tab === 'questions' && await (async () => {
        const { data: stats } = await db.from('category_stats').select('*');
        const st = new Map((stats ?? []).map((x) => [x.category_id, x]));
        const cat = cats?.find((c) => c.slug === searchParams.cat);
        if (!cat) {
          return (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-paper/70">الهدف لكل فئة: {TARGET} سؤالاً معتمداً أو أكثر (٨ لكل مستوى). الفئة تصبح قابلة للعب عند ٢ في كل مستوى.</p>
              {GROUPS.map((g) => (
                <section key={g.key}><h2 className="mb-2 font-bold" style={{ color: g.color }}>{g.emoji} {g.name}</h2>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {(cats ?? []).filter((c) => c.group_key === g.key).map((c) => {
                      const t = st.get(c.id)?.total ?? 0;
                      return <Link key={c.id} href={`/admin?tab=questions&cat=${c.slug}`} className="card !p-3 text-sm"><span className="font-bold">{c.emoji} {c.name}</span>
                        <span className="mt-2 block h-1.5 rounded bg-deep"><span className="block h-1.5 rounded bg-mint" style={{ width: `${Math.min(100, (t / TARGET) * 100)}%` }} /></span>
                        <span className="text-xs text-paper/60">{t.toLocaleString('ar-EG')} / {TARGET.toLocaleString('ar-EG')}</span></Link>;
                    })}
                  </div></section>
              ))}
            </div>
          );
        }
        const { data: qs } = await db.from('questions').select('*').eq('category_id', cat.id).order('status').order('points').limit(300);
        const drafts = (qs ?? []).filter((q) => q.status === 'draft').length;
        const s1 = st.get(cat.id);
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold" style={{ color: cat.color }}>{cat.emoji} {cat.name}</h2>
            <p className="text-sm text-paper/70">معتمد: ٢٠٠ ← {s1?.c200 ?? 0} | ٤٠٠ ← {s1?.c400 ?? 0} | ٦٠٠ ← {s1?.c600 ?? 0}. مسودات بانتظار المراجعة: {drafts}</p>
            {drafts > 0 && <form action={approveAll}><input type="hidden" name="category_id" value={cat.id} /><button className="btn btn-ghost !py-2 text-sm">اعتماد كل المسودات ({drafts}) بعد مراجعتها</button></form>}
            <details className="card" open={!qs?.length}>
              <summary className="cursor-pointer font-bold">＋ سؤال جديد (يُعتمد مباشرة)</summary>
              <form action={saveQuestion} className="mt-3 grid gap-2">
                <input type="hidden" name="category_id" value={cat.id} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="input" name="points"><option>200</option><option>400</option><option>600</option></select>
                  <select className="input" name="type"><option value="text">نص</option><option value="image">صورة</option><option value="audio">صوت</option><option value="video">فيديو</option></select>
                </div>
                <textarea className="input" name="question" placeholder="السؤال" required />
                <input className="input" name="answer" placeholder="الإجابة الصحيحة" required />
                <div className="grid gap-2 sm:grid-cols-3">{[1, 2, 3].map((i) => <input key={i} className="input" name={`wrong${i}`} placeholder={`خيار خاطئ ${i}`} />)}</div>
                <input className="input" name="source" placeholder="المصدر (رواه البخاري، سورة كذا، اسم الكتاب)" />
                <MetaFields />
                <MediaField />
                <input className="input" name="media_credit" placeholder="نسبة الصورة/الترخيص (مثل: الصورة: اسم المصوّر، CC BY-SA 4.0، ويكيميديا كومنز)" />
                <button className="btn btn-primary">حفظ</button>
              </form>
            </details>
            <ul className="flex flex-col gap-2">
              {(qs ?? []).map((q) => (
                <li key={q.id} className="card !p-3 text-sm">
                  <p><span className="ms-1 rounded bg-saffron px-1.5 font-bold text-deep">{q.points}</span>{q.status === 'draft' && <span className="ms-1 rounded bg-rose px-1.5 text-deep">مسودة</span>} {q.question}</p>
                  <p className="text-mint">✔ {q.answer}{q.source ? <span className="text-paper/60"> — {q.source}</span> : null}</p>
                  {q.media_url && <p className="truncate text-xs text-sky" dir="ltr">{q.type}: {q.media_url}</p>}
                  <div className="mt-2 flex gap-3">
                    {q.status === 'draft' && <form action={approveQuestion}><input type="hidden" name="id" value={q.id} /><button className="underline">اعتماد</button></form>}
                    <form action={deleteQuestion}><input type="hidden" name="id" value={q.id} /><button className="text-rose underline">حذف</button></form>
                  </div>
                  <details className="mt-2"><summary className="cursor-pointer text-saffron">🖼️ {q.media_url ? 'تغيير الصورة/الفيديو' : 'إضافة صورة أو فيديو'}</summary>
                    <form action={setMedia} className="mt-2 grid gap-2"><input type="hidden" name="id" value={q.id} />
                      <select className="input" name="type" defaultValue={q.type === 'text' ? 'image' : q.type}><option value="image">صورة</option><option value="video">فيديو (ملف أو رابط يوتيوب)</option><option value="audio">صوت</option></select>
                      <MediaField initial={q.media_url ?? ''} /><input className="input" name="media_credit" placeholder="النسبة والترخيص" defaultValue={q.media_credit ?? ''} />
                      <MetaFields flags={q.flags} source_url={q.source_url} license={q.media_license} />
                      <button className="btn btn-ghost !py-2">حفظ الوسائط (اترك الرابط فارغاً للإزالة)</button></form></details>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {tab === 'reports' && await (async () => {
        const { data } = await db.from('feedback').select('id,reason,created_at,question:questions(question,answer)').eq('kind', 'report').order('created_at', { ascending: false }).limit(100);
        if (!data?.length) return <p className="card">لا توجد بلاغات.</p>;
        return <ul className="space-y-3">{data.map((r) => {
          const q = r.question as unknown as { question: string; answer: string } | null;
          return <li key={r.id} className="card"><p className="font-bold">{q?.question}</p><p className="text-sm text-mint">الإجابة: {q?.answer}</p><p className="text-sm text-saffron">السبب: {r.reason}</p>
            <form action={resolveReport} className="mt-2"><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost !py-1 text-sm">تمت المعالجة</button></form></li>;
        })}</ul>;
      })()}

      {tab === 'import' && <ImportForm />}

      {tab === 'business' && (
        <div className="grid gap-4 md:grid-cols-3">
          <form action={saveSponsor} className="card grid gap-2"><h2 className="font-bold">راعٍ جديد</h2>
            <input className="input" name="name" placeholder="اسم الراعي" required /><MediaField name="logo_url" /><input className="input" dir="ltr" name="url" placeholder="https://" /><textarea className="input" name="blurb" placeholder="سطر تعريفي" /><button className="btn btn-primary">إضافة</button></form>
          <form action={savePack} className="card grid gap-2"><h2 className="font-bold">باقة جديدة</h2>
            <input className="input" name="name" placeholder="الاسم (رمضان ٢٠٢٧)" required /><input className="input" dir="ltr" name="slug" placeholder="ramadan-2027" required /><textarea className="input" name="description" placeholder="وصف" />
            <input className="input" name="price_label" placeholder="نص السعر: ٢٩ ر.س" /><input className="input" dir="ltr" name="stripe_price_id" placeholder="price_... (دفعة واحدة)" /><button className="btn btn-primary">إضافة</button>
            <p className="text-xs text-paper/60">بعد الإضافة اربطها بفئات من تبويب الفئات.</p></form>
          <form action={saveOrg} className="card grid gap-2"><h2 className="font-bold">شركة / فعالية</h2>
            <input className="input" name="name" placeholder="اسم الجهة" required /><input className="input" dir="ltr" name="slug" placeholder="acme  →  /e/acme" required /><MediaField name="logo_url" /><input className="input" dir="ltr" name="color" placeholder="#FFC247" /><input className="input" dir="ltr" name="contact_email" placeholder="بريد التواصل" /><button className="btn btn-primary">إنشاء الرابط</button></form>
        </div>
      )}
    </div>
  );
}
