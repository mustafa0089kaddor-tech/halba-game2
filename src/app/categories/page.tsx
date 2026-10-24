import type { Metadata } from 'next';
import Link from 'next/link';
import { GROUPS } from '@/data/catalog';
import { GUEST, getCategories } from '@/lib/data';
import { ar } from '@/lib/types';

export const revalidate = 600;
export const metadata: Metadata = { title: 'فئات الأسئلة', description: 'مئة وعشرون فئة: اللغة العربية، الأحاديث، السيرة، القصص، سبيس تون، والمسلسلات والأفلام العربية والأجنبية.' };

export default async function Categories() {
  const cats = await getCategories(GUEST);
  return (
    <div className="pt-4">
      <h1 className="mb-1 font-display text-4xl text-saffron">فئات الأسئلة</h1>
      <p className="mb-6 text-paper/75">{ar(cats.length)} فئة في {ar(GROUPS.length)} محاور، تختارون منها ستاً لكل لعبة.</p>
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="المحاور">
        {GROUPS.map((g) => <a key={g.key} href={`#${g.key}`} className="shrink-0 rounded-full bg-tide px-4 py-2 text-sm font-bold hover:bg-reef">{g.emoji} {g.name}</a>)}
      </nav>
      <div className="flex flex-col gap-10">
        {GROUPS.map((g) => (
          <section key={g.key} id={g.key} aria-labelledby={`h-${g.key}`} className="scroll-mt-4">
            <h2 id={`h-${g.key}`} className="mb-3 font-display text-3xl" style={{ color: g.color }}>{g.emoji} {g.name}</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {cats.filter((c) => c.group === g.key).map((c) => c.playable ? (
                <Link key={c.id} href={`/categories/${c.slug}`} className="card !p-3 transition hover:bg-tide" style={{ borderInlineStart: `5px solid ${c.color}` }}>
                  <span className="text-2xl">{c.emoji}</span><span className="mt-1 block text-sm font-bold leading-6">{c.name}</span>
                  {c.premium && <span className="text-xs text-saffron">للمشتركين</span>}
                </Link>
              ) : (
                <div key={c.id} className="card !p-3 opacity-50"><span className="text-2xl">{c.emoji}</span><span className="mt-1 block text-sm font-bold leading-6">{c.name}</span><span className="text-xs">قريباً</span></div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
