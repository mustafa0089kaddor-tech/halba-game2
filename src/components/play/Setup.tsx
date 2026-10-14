'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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

export default function Setup({ cats, names, setNames, picked, setPicked, onStart, busy, error, brand, freeDaily, unlimited, subscriber }: {
  cats: Category[]; names: string[]; setNames: (n: string[]) => void; picked: string[]; setPicked: (p: string[]) => void;
  onStart: () => void; busy: boolean; error: string; brand?: Brand | null; freeDaily: number; unlimited: boolean; subscriber: boolean;
}) {
  const [group, setGroup] = useState<string>('all');
  const [q, setQ] = useState('');
  const open = useMemo(() => cats.filter((c) => c.playable && !c.locked), [cats]);
  const need = Math.min(6, open.length);
  const shown = useMemo(() => cats.filter((c) => (group === 'all' || c.group === group) && (!q.trim() || c.name.includes(q.trim()))), [cats, group, q]);
  const toggle = (c: Category) => {
    if (c.locked || !c.playable) return;
    setPicked(picked.includes(c.id) ? picked.filter((x) => x !== c.id) : picked.length < need ? [...picked, c.id] : picked);
  };
  const ready = picked.length === need && need > 0 && names.every((n) => n.trim().length > 0);
  const byId = (id: string) => cats.find((c) => c.id === id);

  return (
    <div className="flex flex-col gap-6 pb-28 pt-2">
      {brand && <div className="flex items-center gap-3">{brand.logo_url && <img src={brand.logo_url} alt="" className="h-10" />}<p className="font-bold">{brand.name}</p></div>}
      <section aria-labelledby="t">
        <h1 id="t" className="mb-3 font-display text-3xl text-saffron">الفريقان</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <label key={i} className="block">
              <span className={`mb-1 block text-sm font-bold ${i === 0 ? 'text-rose' : 'text-sky'}`}>اسم الفريق {i === 0 ? 'الأول' : 'الثاني'}</span>
              <input className="input" maxLength={20} value={names[i]} onChange={(e) => setNames(names.map((n, k) => (k === i ? e.target.value : n)))} />
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="c">
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 id="c" className="font-display text-3xl text-saffron">اختاروا {ar(need)} محاور</h2>
          <button className="btn btn-ghost !px-3 !py-2 text-sm" onClick={() => setPicked(randomPick(open, need))} disabled={!open.length}>🎲 عشوائي</button>
        </div>

        {picked.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2" aria-label="المحاور المختارة">
            {picked.map((id) => { const c = byId(id); return c && (
              <li key={id}><button className="rounded-full px-3 py-1 text-sm font-bold text-deep" style={{ background: c.color }} onClick={() => setPicked(picked.filter((x) => x !== id))} aria-label={`إزالة ${c.name}`}>{c.emoji} {c.name} ×</button></li>
            ); })}
          </ul>
        )}

        <input className="input mb-3" type="search" placeholder="ابحث عن فئة…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في الفئات" />
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="المحاور">
          {[{ key: 'all', name: 'الكل', emoji: '✨' }, ...GROUPS].map((g) => (
            <button key={g.key} role="tab" aria-selected={group === g.key} onClick={() => setGroup(g.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${group === g.key ? 'bg-saffron text-deep' : 'bg-tide text-paper hover:bg-reef'}`}>{g.emoji} {g.name}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {shown.map((c) => {
            const on = picked.includes(c.id);
            const off = c.locked || !c.playable;
            return (
              <button key={c.id} onClick={() => toggle(c)} aria-pressed={on} aria-disabled={off}
                className={`relative rounded-2xl border-2 p-3 text-start transition ${on ? 'bg-tide' : 'bg-tide/40 hover:bg-tide/70'} ${off ? 'cursor-not-allowed opacity-45' : ''}`}
                style={{ borderColor: on ? c.color : 'transparent' }}>
                <span className="text-2xl">{c.emoji}</span>
                <span className="mt-1 block text-sm font-bold leading-6">{c.name}</span>
                {c.sponsor && <span className="block text-xs text-paper/60">برعاية {c.sponsor.name}</span>}
                {!c.playable && <span className="text-xs text-paper/70">قريباً</span>}
                {c.locked && c.playable && <span className="absolute end-2 top-2" aria-label="مقفلة">🔒</span>}
                {on && <span className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full text-deep" style={{ background: c.color }} aria-hidden>✓</span>}
              </button>
            );
          })}
          {!shown.length && <p className="col-span-full py-6 text-center text-paper/70">لا توجد فئة بهذا الاسم.</p>}
        </div>
        {cats.some((c) => c.locked && c.playable) && <p className="mt-3 text-sm text-paper/70">الفئات المقفلة للمشتركين أو تُباع كباقات. <Link href="/pricing" className="text-saffron underline">شاهد الخيارات</Link></p>}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-reef/60 bg-deep/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          {error && <p role="alert" className="mb-2 text-center text-sm text-rose">{error}</p>}
          <button className="btn btn-primary w-full text-lg" disabled={!ready || busy} onClick={onStart}>
            {busy ? 'لحظة…' : ready ? 'ابدأ اللعب' : `اختر ${ar(need - picked.length)} ${need - picked.length === 1 ? 'محور' : 'محاور'} أخرى`}
          </button>
          {!unlimited && !subscriber && <p className="mt-1 text-center text-xs text-paper/60">{ar(freeDaily)} ألعاب مجانية في اليوم</p>}
        </div>
      </div>
    </div>
  );
}
