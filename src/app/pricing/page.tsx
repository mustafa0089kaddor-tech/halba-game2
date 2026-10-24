import type { Metadata } from 'next';
import BuyButton from '@/components/BuyButton';
import { getPacks } from '@/lib/data';
import { FREE_DAILY } from '@/lib/env';
import { ar } from '@/lib/types';

export const revalidate = 300;
export const metadata: Metadata = { title: 'الاشتراك والباقات', description: 'ألعاب غير محدودة، بدون إعلانات، وفئات حصرية. أو اشترِ باقات موسمية بدفعة واحدة.' };

export default async function Pricing() {
  const packs = await getPacks();
  const m = process.env.NEXT_PUBLIC_PRICE_MONTHLY_LABEL ?? '';
  const y = process.env.NEXT_PUBLIC_PRICE_YEARLY_LABEL ?? '';
  return (
    <div className="flex flex-col gap-10 pt-4">
      <header><h1 className="font-display text-4xl text-saffron">العبوا أكثر</h1><p className="mt-2 text-paper/75">المجاني يكفي لتجربة اللعبة. الاشتراك لمن يلعب كل أسبوع.</p></header>
      <section className="grid gap-4 md:grid-cols-3" aria-label="الخطط">
        <div className="card"><h2 className="font-display text-2xl">مجاني</h2><p className="my-2 text-3xl font-bold">٠</p>
          <ul className="space-y-2 text-sm leading-7 text-paper/80"><li>{ar(FREE_DAILY)} ألعاب في اليوم</li><li>الفئات المفتوحة</li><li>إعلانات بين الجولات</li></ul></div>
        <div className="card ring-2 ring-saffron"><h2 className="font-display text-2xl text-saffron">شهري</h2><p className="my-2 text-3xl font-bold">{m}</p>
          <ul className="mb-4 space-y-2 text-sm leading-7 text-paper/80"><li>ألعاب غير محدودة</li><li>بدون إعلانات</li><li>فئات حصرية للمشتركين</li></ul>
          <BuyButton plan="monthly" label="اشترك شهرياً" /></div>
        <div className="card"><h2 className="font-display text-2xl">سنوي</h2><p className="my-2 text-3xl font-bold">{y}</p>
          <ul className="mb-4 space-y-2 text-sm leading-7 text-paper/80"><li>كل مزايا الشهري</li><li>أوفر من الدفع الشهري</li></ul>
          <BuyButton plan="yearly" label="اشترك سنوياً" className="btn btn-ghost w-full" /></div>
      </section>
      {packs.length > 0 && (
        <section aria-labelledby="p"><h2 id="p" className="mb-3 font-display text-3xl">باقات بدفعة واحدة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {packs.map((p) => (
              <div key={p.id} className="card"><h3 className="text-xl font-bold">{p.name}</h3><p className="my-2 text-sm text-paper/75">{p.description}</p><p className="mb-3 text-2xl font-bold">{p.price_label}</p>
                <BuyButton packId={p.id} label="اشترِ الباقة" className="btn btn-primary w-full" /></div>
            ))}
          </div></section>
      )}
      <p className="text-sm text-paper/60">الدفع عبر Stripe. يمكنك إلغاء الاشتراك في أي وقت من صفحة حسابك. راجع <a href="/refund" className="underline">سياسة الاسترجاع</a>.</p>
    </div>
  );
}
