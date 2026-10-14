import type { Metadata } from 'next';
import { getSponsors } from '@/lib/data';
import { CONTACT } from '@/lib/env';

export const revalidate = 600;
export const metadata: Metadata = { title: 'الرعاة', description: 'الشركات التي ترعى فئات حلبة، وكيف ترعى فئتك.' };

export default async function Sponsors() {
  const list = await getSponsors();
  return (
    <div className="pt-4">
      <h1 className="font-display text-4xl text-saffron">الرعاة</h1>
      <p className="mt-2 max-w-xl leading-8 text-paper/80">بعض الفئات تحمل اسم راعٍ وشعاره. شكراً لمن يجعل اللعب مجانياً لأكبر عدد من الناس.</p>
      {list.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((s) => (
            <div key={s.id} className="card flex items-start gap-4">
              {s.logo_url ? <img src={s.logo_url} alt={s.name} className="h-14 w-14 rounded-lg bg-paper object-contain p-1" /> : <span className="grid h-14 w-14 place-items-center rounded-lg bg-reef text-2xl">★</span>}
              <div><h2 className="font-bold">{s.url ? <a href={s.url} rel="sponsored noopener" target="_blank" className="underline">{s.name}</a> : s.name}</h2><p className="text-sm text-paper/70">{s.blurb}</p></div>
            </div>
          ))}
        </div>
      )}
      <section className="card mt-10 max-w-xl">
        <h2 className="font-display text-2xl">ارعَ فئة</h2>
        <p className="my-2 leading-8 text-paper/80">نصمّم معك فئة بأسئلة عن مجالك أو موسمك، يظهر فيها اسمك وشعارك داخل اللعبة وفي صفحة الفئة، ويُذكر بوضوح أنها برعايتك.</p>
        <a className="btn btn-primary" href={`mailto:${CONTACT}?subject=${encodeURIComponent('رعاية فئة في حلبة')}`}>راسلنا</a>
      </section>
    </div>
  );
}
