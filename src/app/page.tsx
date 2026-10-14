import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { GROUPS } from '@/data/catalog';
import { GUEST, getCategories } from '@/lib/data';
import { ar } from '@/lib/types';

export const revalidate = 600;

const MINI = [[200, 200, 400, 400, 600, 600], [200, 200, 400, 400, 600, 600], [200, 200, 400, 400, 600, 600]];
const USED: Record<string, 'a' | 'b'> = { '0-0': 'a', '0-3': 'b', '1-1': 'b', '2-0': 'a', '2-4': 'a' };

export default async function Home() {
  const cats = await getCategories(GUEST);
  return (
    <div className="flex flex-col gap-14 pt-4">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl leading-[1.25] text-saffron sm:text-6xl">فريقان.<br />لوحة واحدة.<br />وسهرة تحدٍّ.</h1>
          <p className="mt-4 max-w-md leading-8 text-paper/80">اختاروا فئاتكم، اكشفوا الأسئلة بالتناوب، واجمعوا النقاط. يلعب الكل على جهاز واحد، ويدير المضيف الجولة بضغطة.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/play" className="btn btn-primary text-lg">ابدأ لعبة الآن</Link>
            <Link href="/pricing" className="btn btn-line">الاشتراك</Link>
          </div>
          <p className="mt-3 text-sm text-paper/60">بدون حساب. تعمل على الجوال.</p>
        </div>
        <div aria-hidden="true" className="rounded-3xl bg-deep p-4 shadow-[0_0_0_2px_#1B6477]">
          <div className="flex flex-col gap-3">
            {MINI.map((row, r) => (
              <div key={r} className="grid grid-cols-6 gap-1.5">
                {row.map((p, c) => {
                  const u = USED[`${r}-${c}`];
                  return <span key={c} className={`grid h-12 place-items-center rounded-xl font-display text-lg ${u === 'a' ? 'bg-rose/25 text-rose' : u === 'b' ? 'bg-sky/25 text-sky' : 'bg-saffron text-deep'}`}>{u ? '✓' : ar(p)}</span>;
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="mb-4 font-display text-3xl">كيف تُلعب؟</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {['اختاروا اسمي الفريقين وحتى ٦ فئات.', 'يختار كل فريق خانة بدوره، فيظهر السؤال مع مؤقت.', 'اكشفوا الإجابة، ويضغط المضيف على الفريق الذي أجاب صح.'].map((t, i) => (
            <li key={i} className="card flex gap-3"><span className="font-display text-3xl text-saffron">{ar(i + 1)}</span><span className="leading-8">{t}</span></li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-paper/70">لكل فريق مساعدات مرة واحدة: مضاعفة النقاط، حذف خيارين، ووقت إضافي.</p>
      </section>

      <section aria-labelledby="cats">
        <div className="mb-4 flex items-end justify-between"><h2 id="cats" className="font-display text-3xl">{ar(cats.length)} فئة، وتختارون ستاً</h2><Link href="/categories" className="text-sm text-saffron underline">كل الفئات</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <Link key={g.key} href={`/categories#${g.key}`} className="card transition hover:bg-tide" style={{ borderInlineStart: `6px solid ${g.color}` }}>
              <span className="text-3xl">{g.emoji}</span><span className="mt-1 block font-bold">{g.name}</span>
              <span className="text-xs text-paper/60">{ar(cats.filter((c) => c.group === g.key).length)} فئة</span>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm text-paper/70">الأسئلة تُسحب عشوائياً من بنك كبير، ويُفضَّل ما لم تروه من قبل.</p>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />
    </div>
  );
}
