'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { GROUPS } from '@/data/catalog';
import { ar, type Brand, type Category } from '@/lib/types';

/** اختيار عشوائي يوزّع الفئات على أكبر عدد ممكن من المحاور */
function randomPick(cats: Category[], need: number): string[] {
  const pool = [...cats].sort(() => Math.random() - 0.5);
  const out: Category[] = [];
  const used = new Set<string>();
  while (out.length < need && pool.length) {
    const i = pool.findIndex((c) => !used.has(c.group));
    const [c] = pool.splice(i >= 0 ? i : 0, 1);
    out.push(c); used.add(c.group);
    if (used.size === GROUPS.length) used.clear();
  }
  return out.map((c) => c.id);
}

/** عدد الألعاب الكاملة المتاحة: كل لعبة تستهلك سؤالين من كل مستوى نقاط */
function gamesOf(c: Category): number {
  const n = Math.min(c.counts?.[200] ?? 0, c.counts?.[400] ?? 0, c.counts?.[600] ?? 0);
  return Math.floor(n / 2);
}

/** رقم ثابت من معرّف الفئة لاختيار نقش الخلفية */
function hashOf(s: string): number {
  return s.split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
}

/** نقوش SVG خفيفة لمنطقة الرسوم: حلقات حلبة، أشعة، شبكة معينات، نقاط */
function ArtPattern({ variant }: { variant: number }) {
  const line = { fill: 'none', stroke: '#FFFFFF', strokeOpacity: 0.16, strokeWidth: 1.2 } as const;
  return (
    <svg className="cat-card__pattern" viewBox="0 0 120 96" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {variant === 0 && [14, 26, 38, 50, 62].map((r) => <circle key={r} cx={60} cy={48} r={r} {...line} />)}
      {variant === 1 && Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 8;
        return <line key={i} x1={60} y1={48} x2={+(60 + Math.cos(a) * 90).toFixed(1)} y2={+(48 + Math.sin(a) * 90).toFixed(1)} {...line} />;
      })}
      {variant === 2 && Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <path d={`M${-40 + i * 20} 0L${40 + i * 20} 96`} {...line} />
          <path d={`M${160 - i * 20} 0L${80 - i * 20} 96`} {...line} />
        </g>
      ))}
      {variant === 3 && Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={12 + (i % 5) * 24 + (Math.floor(i / 5) % 2) * 12} cy={12 + Math.floor(i / 5) * 24} r={2.4} fill="#FFFFFF" fillOpacity={0.18} />
      ))}
    </svg>
  );
}

export default function Setup({ cats, names, setNames, picked, setPicked, onStart, busy, error, brand, freeDaily, unlimited, subscriber }: {
  cats: Category[]; names: string[]; setNames: (n: string[]) => void; picked: string[]; setPicked: (p: string[]) => void;
  onStart: () => void; busy: boolean; error: string; brand?: Brand | null; freeDaily: number; unlimited: boolean; subscriber: boolean;
}) {
  const [group, setGroup] = useState<string>('all');
  const [q, setQ] = useState('');
  const [infoId, setInfoId] = useState<string | null>(null);
  const open = useMemo(() => cats.filter((c) => c.playable && !c.locked), [cats]);
  const need = Math.min(6, open.length);
  const shown = useMemo(() => cats.filter((c) => (group === 'all' || c.group === group) && (!q.trim() || c.name.includes(q.trim()))), [cats, group, q]);
  const toggle = (c: Category) => {
    if (c.locked || !c.playable) return;
    setPicked(picked.includes(c.id) ? picked.filter((x) => x !== c.id) : picked.length < need ? [...picked, c.id] : picked);
  };
  const ready = picked.length === need && need > 0 && names.every((n) => n.trim().length > 0);
  const byId = (id: string) => cats.find((c) => c.id === id);
  const info = infoId ? byId(infoId) : undefined;

  /** إغلاق نافذة المعلومات بزر Escape */
  useEffect(() => {
    if (!infoId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInfoId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [infoId]);

  return (
    <div className="flex flex-col gap-7 pb-32 pt-2">
      {brand && (
        <div className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-tide/50 p-3 backdrop-blur">
          {brand.logo_url && <img src={brand.logo_url} alt="" className="h-10" />}
          <p className="font-display font-bold">{brand.name}</p>
        </div>
      )}

      <section aria-labelledby="t">
        <h1 id="t" className="mb-3 font-display text-3xl font-black text-paper">الفريقان</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <label key={i} className={`block rounded-2xl border border-t-4 border-purple-500/30 bg-tide/50 p-3.5 backdrop-blur ${i === 0 ? 'border-t-rose' : 'border-t-sky'}`}>
              <span className={`mb-1.5 flex items-center gap-2 text-sm font-extrabold ${i === 0 ? 'text-rose' : 'text-sky'}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" aria-hidden />
                اسم الفريق {i === 0 ? 'الأول' : 'الثاني'}
              </span>
              <input className="input font-display text-lg font-bold" maxLength={20} value={names[i]} onChange={(e) => setNames(names.map((n, k) => (k === i ? e.target.value : n)))} />
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="c">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <h2 id="c" className="font-display text-2xl font-black text-paper sm:text-3xl">اختاروا {ar(need)} محاور</h2>
            <p className="mt-1 text-sm text-paper/60">{ar(picked.length)} من {ar(need)} مختارة</p>
          </div>
          <button className="btn btn-ghost !px-3 !py-2 text-sm" onClick={() => setPicked(randomPick(open, need))} disabled={!open.length}>🎲 عشوائي</button>
        </div>

        <div className="pick-meter mb-4" aria-hidden>
          {Array.from({ length: need }, (_, i) => <span key={i} data-on={i < picked.length} />)}
        </div>

        {picked.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-2" aria-label="المحاور المختارة">
            {picked.map((id) => { const c = byId(id); return c && (
              <li key={id}><button className="rounded-full px-3 py-1.5 text-sm font-extrabold text-deep shadow-[0_3px_0_rgba(0,0,0,.35)] transition active:translate-y-0.5 active:shadow-none" style={{ background: c.color }} onClick={() => setPicked(picked.filter((x) => x !== id))} aria-label={`إزالة ${c.name}`}>{c.emoji} {c.name} ×</button></li>
            ); })}
          </ul>
        )}

        <div className="relative mb-3">
          <svg className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-paper/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden focusable="false">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input className="input ps-12" type="search" placeholder="ابحث عن فئة…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في الفئات" />
        </div>

        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2" role="tablist" aria-label="المحاور">
          {[{ key: 'all', name: 'الكل', emoji: '✨' }, ...GROUPS].map((g) => (
            <button key={g.key} role="tab" aria-selected={group === g.key} onClick={() => setGroup(g.key)} className="chip-tab">{g.emoji} {g.name}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((c) => {
            const on = picked.includes(c.id);
            const off = c.locked || !c.playable;
            const tone = !c.playable ? 'muted' : c.locked ? 'lock' : 'gold';
            return (
              <div key={c.id} className="relative">
                <button type="button" onClick={() => toggle(c)} aria-pressed={on} aria-disabled={off}
                  data-on={on} data-off={off} className="cat-card" style={{ '--cat': c.color } as CSSProperties}>
                  <span className="cat-card__art">
                    <ArtPattern variant={hashOf(c.id) % 4} />
                    <span className="cat-card__ribbon" data-tone={tone}>
                      {!c.playable ? 'قريباً' : c.locked ? '🔒 مقفلة' : `${ar(gamesOf(c))} لعبة`}
                    </span>
                    <span className="cat-card__emoji" aria-hidden>{c.emoji}</span>
                    {on && (
                      <span className="cat-card__check" aria-hidden>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      </span>
                    )}
                  </span>
                  <span className="cat-card__title">
                    {c.name}
                    {c.sponsor && <span className="cat-card__sponsor">برعاية {c.sponsor.name}</span>}
                  </span>
                </button>
                <button type="button" className="cat-card__info" onClick={() => setInfoId(c.id)} aria-label={`معلومات عن ${c.name}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden focusable="false">
                    <circle cx="12" cy="6.5" r="1.9" /><rect x="10.5" y="10.2" width="3" height="8.6" rx="1.5" />
                  </svg>
                </button>
              </div>
            );
          })}
          {!shown.length && (
            <p className="col-span-full py-6 text-center text-paper/70">
              {q.trim() ? 'لا توجد فئة بهذا الاسم.' : 'لا توجد فئات في هذا المحور بعد.'}
            </p>
          )}
        </div>
        {cats.some((c) => c.locked && c.playable) && <p className="mt-4 text-sm text-paper/70">الفئات المقفلة للمشتركين أو تُباع كباقات. <Link href="/pricing" className="font-bold text-saffron underline">شاهد الخيارات</Link></p>}
      </section>

      {info && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-deep/75 p-3 backdrop-blur-sm sm:items-center" onClick={() => setInfoId(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="info-t" className="sheet w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: info.color }} aria-hidden>{info.emoji}</span>
              <div className="min-w-0">
                <h3 id="info-t" className="font-display text-xl font-black leading-snug">{info.name}</h3>
                {info.sponsor && <p className="text-xs text-paper/60">برعاية {info.sponsor.name}</p>}
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-paper/85">
              {info.description?.trim() || `كل لعبة تستخدم سؤالين من كل مستوى نقاط (${ar(200)} و${ar(400)} و${ar(600)}).`}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([200, 400, 600] as const).map((p) => (
                <div key={p} className="rounded-xl border border-purple-500/30 bg-deep/60 p-2 text-center">
                  <p className="font-display text-lg font-black text-saffron">{ar(info.counts?.[p] ?? 0)}</p>
                  <p className="text-xs text-paper/60">سؤال بـ {ar(p)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn btn-primary flex-1" disabled={info.locked || !info.playable} onClick={() => { toggle(info); setInfoId(null); }}>
                {picked.includes(info.id) ? 'إزالة من الاختيار' : 'اختر هذا المحور'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setInfoId(null)} autoFocus>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-purple-500/30 bg-deep/85 px-4 pt-3 backdrop-blur-xl" style={{ paddingBottom: 'max(0.9rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto max-w-5xl">
          {error && <p role="alert" className="mb-2 text-center text-sm text-rose">{error}</p>}
          <button className="btn btn-primary w-full text-lg" disabled={!ready || busy} onClick={onStart}>
            {busy ? 'لحظة…' : ready ? 'ابدأ اللعب' : `اختر ${ar(need - picked.length)} ${need - picked.length === 1 ? 'محور' : 'محاور'} أخرى`}
          </button>
          {!unlimited && !subscriber && <p className="mt-2 text-center text-xs text-paper/60">{ar(freeDaily)} ألعاب مجانية في اليوم</p>}
        </div>
      </div>
    </div>
  );
}
