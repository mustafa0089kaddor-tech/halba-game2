import type { Metadata } from 'next';
import { CONTACT } from '@/lib/env';

export const metadata: Metadata = { title: 'للشركات والفعاليات', description: 'نسخة من حلبة برابط خاص وشعار شركتك لفعالياتكم وفرقكم.' };

export default function Business() {
  return (
    <div className="pt-4">
      <h1 className="font-display text-4xl text-saffron">حلبة لفعاليتكم</h1>
      <p className="mt-2 max-w-xl leading-8 text-paper/80">رابط خاص يحمل اسم شركتكم وشعارها، تلعبون عليه في الاجتماعات واليوم الرياضي وحفلات نهاية العام.</p>
      <ul className="my-6 max-w-xl space-y-3">
        {['شعار الشركة واسمها على شاشة الإعداد والسؤال والنتيجة', 'ألعاب غير محدودة، وبدون إعلانات', 'فئات مخصصة بأسئلة عن شركتكم عند الطلب', 'مناسب للعرض على شاشة كبيرة'].map((t) => <li key={t} className="card !p-3">{t}</li>)}
      </ul>
      <a className="btn btn-primary" href={`mailto:${CONTACT}?subject=${encodeURIComponent('نسخة الشركات في حلبة')}`}>اطلب عرضاً</a>
      <p className="mt-3 text-sm text-paper/60">في البداية نُنشئ الرابط لكم يدوياً خلال يوم عمل.</p>
    </div>
  );
}
