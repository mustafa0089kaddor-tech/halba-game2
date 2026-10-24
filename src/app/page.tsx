import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import { GROUPS } from '@/data/catalog';
import { GUEST, getCategories } from '@/lib/data';
import { ar } from '@/lib/types';

export const revalidate = 600;

const MINI = [[200, 200, 400, 400, 600, 600], [200, 200, 400, 400, 600, 600], [200, 200, 400, 400, 600, 600]];
const USED: Record<string, 'a' | 'b'> = { '0-0': 'a', '0-3': 'b', '1-1': 'b', '2-0': 'a', '2-4': 'a' };

/* نقاط الفريقين في اللوحة التجريبية تُحسب من الخانات المكشوفة نفسها */
const SCORE = Object.entries(USED).reduce(
  (s, [k, t]) => {
    const [r, c] = k.split('-').map(Number);
    s[t] += MINI[r][c];
    return s;
  },
  { a: 0, b: 0 },
);
const TEAMS = [
  { id: 'a', name: 'الصقور', color: '#FF5C8A' },
  { id: 'b', name: 'النمور', color: '#6EA8FF' },
] as const;

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const STEPS = [
  {
    text: 'اختاروا اسمي الفريقين وحتى ٦ فئات.',
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3.5 19c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5M15 14.3c2.5-.3 4.7 1.1 5.5 4.2" />
      </Icon>
    ),
  },
  {
    text: 'يختار كل فريق خانة بدوره، فيظهر السؤال مع مؤقت.',
    icon: (
      <Icon>
        <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="currentColor" fillOpacity=".25" />
      </Icon>
    ),
  },
  {
    text: 'اكشفوا الإجابة، ويضغط المضيف على الفريق الذي أجاب صح.',
    icon: (
      <Icon>
        <path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6z" />
        <path d="m9.5 12 1.8 1.8 3.2-3.6" />
      </Icon>
    ),
  },
];

function Feature({ icon, title, className = '', children }: { icon: ReactNode; title: string; className?: string; children: ReactNode }) {
  return (
    <article className={`card relative overflow-hidden bg-gradient-to-br from-white/[.07] to-transparent p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] ${className}`}>
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-reef to-tide text-saffron ring-1 ring-saffron/30">{icon}</span>
      <h3 className="mb-1 font-display text-xl font-bold">{title}</h3>
      <div className="leading-8 text-paper/80">{children}</div>
    </article>
  );
}

/* نقش الحلبة خلف الإيموجي: حلقات متداخلة وأشعة وشرارات بلون الفئة */
function Pattern() {
  return (
    <svg className="cat-card__pattern" style={{ color: 'var(--cat)' }} viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <g stroke="#fff" strokeOpacity=".12">
        <circle cx="100" cy="68" r="34" />
        <circle cx="100" cy="68" r="56" strokeOpacity=".08" />
        <circle cx="100" cy="68" r="80" strokeOpacity=".05" />
        <path d="M100 68 8 8M100 68l92-60M100 68 8 128M100 68l92 60M100 68V-20M100 68v100" strokeOpacity=".07" />
      </g>
      <g fill="currentColor" fillOpacity=".55">
        <path d="M24 28l2.4 6.6L33 37l-6.6 2.4L24 46l-2.4-6.6L15 37l6.6-2.4z" />
        <path d="M172 112l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2z" />
        <circle cx="168" cy="30" r="3" />
        <circle cx="30" cy="124" r="2.4" />
      </g>
    </svg>
  );
}

export default async function Home() {
  const cats = await getCategories(GUEST);
  const demo = cats.filter((c) => c.playable).slice(0, 3);
  return (
    <div className="flex flex-col gap-20 pt-4">
      {/* ===== القسم الرئيسي ===== */}
      <section className="relative isolate -mx-4 grid items-center gap-10 overflow-x-clip px-4 pt-6 md:grid-cols-[1.05fr_.95fr] md:pt-10">
        <div aria-hidden="true" className="rays !-top-28 opacity-70" />
        <div className="relative z-10">
          <span className="q-turn" style={{ '--team': '#00F5D4' } as CSSProperties}>الجولة جاهزة</span>
          <h1 className="winner-title mt-5 text-5xl sm:text-6xl lg:text-7xl">فريقان.<br />لوحة واحدة.<br />وسهرة تحدٍّ.</h1>
          <p className="mt-5 max-w-md leading-8 text-paper/80">اختاروا فئاتكم، اكشفوا الأسئلة بالتناوب، واجمعوا النقاط. يلعب الكل على جهاز واحد، ويدير المضيف الجولة بضغطة.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/play" className="btn btn-primary px-8 py-4 text-xl">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M17 4v16L5 12z" /></svg>
              ابدأ اللعب الآن
            </Link>
            <Link href="/pricing" className="btn btn-line">الاشتراك</Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-volt">
            {['بدون حساب', 'على جهاز واحد', 'تعمل على الجوال'].map((t) => (
              <li key={t} className="rounded-full border border-volt/40 bg-volt/10 px-3 py-1 shadow-[0_0_16px_-4px_rgba(0,245,212,.6)]">{t}</li>
            ))}
          </ul>
        </div>

        {/* لوحة لعب حيّة: الخانات تستجيب للمس والتمرير */}
        <div aria-hidden="true" className="relative z-10">
          <div className="q-panel">
            <div className="q-panel__inner !items-stretch !gap-4 !p-4 sm:!p-5">
              <div className="score-strip">
                {TEAMS.map((t) => (
                  <div key={t.id} className="team-card" data-active={t.id === 'a'} style={{ '--team': t.color } as CSSProperties}>
                    <span className="team-card__turn">دوركم</span>
                    <p className="team-card__name">{t.name}</p>
                    <p className="team-card__score">{ar(SCORE[t.id])}</p>
                  </div>
                ))}
              </div>
              {demo.map((c, r) => (
                <div key={c.id} className="rounded-2xl border border-purple-500/30 bg-tide/40 p-3">
                  <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold"><span>{c.emoji}</span>{c.name}</p>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {MINI[r].map((p, i) => {
                      const u = USED[`${r}-${i}`];
                      return (
                        <span key={i} className="pts-btn" data-done={u ? 'true' : undefined}>
                          {ar(p)}
                          {u && <span className={`pts-btn__check ${u === 'a' ? 'text-rose' : 'text-sky'}`}>✓</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== كيف تُلعب؟ ===== */}
      <section aria-labelledby="how">
        <h2 id="how" className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">كيف تُلعب؟</h2>
        <ol className="relative grid gap-12 md:grid-cols-3 md:gap-5">
          <span aria-hidden="true" className="absolute inset-x-[17%] top-0 hidden border-t-2 border-dashed border-purple-400/30 md:block" />
          {STEPS.map((s, i) => (
            <li key={i} className="card relative bg-gradient-to-b from-white/[.07] to-transparent px-5 pb-6 pt-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.14)]">
              <span className="absolute inset-x-0 -top-6 mx-auto grid h-12 w-12 place-items-center rounded-2xl font-display text-2xl font-bold text-[#2B1700] shadow-[0_4px_0_#A65A00,inset_0_2px_0_rgba(255,255,255,.5)] [background:linear-gradient(180deg,#FFD05A,#FFB800_50%,#FF8A00)]">{ar(i + 1)}</span>
              <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-deep/60 text-volt ring-1 ring-volt/30">{s.icon}</span>
              <p className="leading-8">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== المميزات ===== */}
      <section aria-labelledby="feat">
        <h2 id="feat" className="mb-8 text-center font-display text-3xl font-bold sm:text-4xl">كل ما تحتاجه السهرة</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            className="md:col-span-2"
            title="مساعدات لكل فريق"
            icon={<Icon><path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" /></Icon>}
          >
            <p>لكل فريق مساعدات مرة واحدة، يستخدمها في اللحظة المناسبة.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="ctl-chip">٢× مضاعفة النقاط</span>
              <span className="ctl-chip">½ حذف خيارين</span>
              <span className="ctl-chip">+ وقت إضافي</span>
            </div>
          </Feature>
          <Feature title="مؤقت لكل سؤال" icon={<Icon><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5" /></Icon>}>
            <p>يظهر السؤال مع مؤقت، ويدير المضيف الجولة بضغطة.</p>
          </Feature>
          <Feature title="بنك أسئلة كبير" icon={<Icon><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></Icon>}>
            <p>الأسئلة تُسحب عشوائياً من بنك كبير، ويُفضَّل ما لم تروه من قبل.</p>
          </Feature>
          <Feature
            className="md:col-span-2"
            title="جهاز واحد للجميع"
            icon={<Icon><rect x="6.5" y="2.5" width="11" height="19" rx="3" /><path d="M10.5 18.5h3" /></Icon>}
          >
            <p>يلعب الكل على جهاز واحد. بدون حساب وبدون تحميل، وتعمل على الجوال.</p>
          </Feature>
        </div>
      </section>

      {/* ===== الفئات ===== */}
      <section aria-labelledby="cats">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="cats" className="font-display text-3xl font-bold sm:text-4xl">{ar(cats.length)} فئة، وتختارون ستاً</h2>
          <Link href="/categories" className="btn btn-line !py-2 text-sm">كل الفئات</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <Link key={g.key} href={`/categories#${g.key}`} className="cat-card" style={{ '--cat': g.color } as CSSProperties}>
              <span className="cat-card__art">
                <Pattern />
                <span className="cat-card__ribbon">{ar(cats.filter((c) => c.group === g.key).length)} فئة</span>
                <span className="cat-card__emoji" aria-hidden="true">{g.emoji}</span>
              </span>
              <span className="cat-card__title">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== دعوة أخيرة ===== */}
      <section className="q-panel" aria-labelledby="go">
        <div className="q-panel__inner py-10">
          <h2 id="go" className="font-display text-3xl font-bold sm:text-4xl">جاهزون للتحدي؟</h2>
          <p className="max-w-md leading-8 text-paper/80">اختاروا فئاتكم وابدؤوا الجولة الأولى الآن.</p>
          <Link href="/play" className="btn btn-primary mt-2 px-8 py-4 text-xl">ابدأ اللعب الآن</Link>
        </div>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />
    </div>
  );
}
