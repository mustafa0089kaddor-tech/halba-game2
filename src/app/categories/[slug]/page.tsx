import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import { GUEST, getCategories, getTeasers } from '@/lib/data';
import { ar } from '@/lib/types';

export const revalidate = 600;

async function load(slug: string) {
  const cat = (await getCategories(GUEST)).find((c) => c.slug === slug);
  if (!cat) return null;
  return { cat, teasers: await getTeasers(cat) }; // نصوص أسئلة ٢٠٠ نقطة فقط، بلا إجابات
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const d = await load(params.slug);
  if (!d) return {};
  return { title: `أسئلة ${d.cat.name}`, description: `${d.cat.description ?? ''} العبها مع فريقك على حلبة: ست خانات من ٢٠٠ إلى ٦٠٠ نقطة.`, alternates: { canonical: `/categories/${d.cat.slug}` }, robots: d.cat.playable ? undefined : { index: false } };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const d = await load(params.slug);
  if (!d) notFound();
  const { cat, teasers } = d;
  return (
    <article className="pt-4">
      <p className="text-5xl">{cat.emoji}</p>
      <h1 className="mt-2 font-display text-4xl" style={{ color: cat.color }}>أسئلة {cat.name}</h1>
      <p className="mt-3 max-w-xl leading-8 text-paper/80">{cat.description} في كل لعبة تظهر ستة أسئلة: اثنان بـ٢٠٠ نقطة، واثنان بـ٤٠٠، واثنان بـ٦٠٠.</p>
      {cat.sponsor && (
        <p className="mt-3 flex items-center gap-2 text-sm text-paper/70">برعاية {cat.sponsor.logo_url && <img src={cat.sponsor.logo_url} alt="" className="h-6" />}
          {cat.sponsor.url ? <a href={cat.sponsor.url} rel="sponsored noopener" target="_blank" className="underline">{cat.sponsor.name}</a> : cat.sponsor.name}</p>
      )}
      {teasers.length > 0 && (
        <section className="mt-6"><h2 className="mb-2 font-bold">نموذج من الأسئلة</h2>
          <ul className="space-y-2">{teasers.map((t) => <li key={t} className="card !p-3">{t}</li>)}</ul></section>
      )}
      <Link href={cat.premium ? '/pricing' : `/play?cat=${cat.slug}`} className="btn btn-primary mt-6">{cat.premium ? 'اشترك لفتح الفئة' : 'العب هذه الفئة'}</Link>
      <p className="mt-2 text-sm text-paper/60">في البنك {ar(cat.counts[200] + cat.counts[400] + cat.counts[600])} سؤالاً في هذه الفئة.</p>
      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} className="mt-8" />
    </article>
  );
}
