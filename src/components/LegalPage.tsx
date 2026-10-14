export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="prose-ar max-w-2xl pt-4">
      <h1 className="mb-1 font-display text-4xl text-saffron">{title}</h1>
      <p className="mb-6 text-sm text-paper/60">آخر تحديث: {updated}</p>
      {children}
      <p className="mt-10 rounded-xl bg-tide/60 p-4 text-sm text-paper/70">هذه الصفحة قالب عام. راجعها مع مختص قانوني في بلدك قبل الإطلاق، وعدّل بيانات الجهة المشغّلة والمدد المذكورة بما يناسب عملك.</p>
    </article>
  );
}
