/** حقول العلامات والمصدر والحقوق. تُستخدم في نموذج السؤال الجديد وتحرير الوسائط. */
const FLAGS: [string, string][] = [['religious', '🕌'], ['film', '🎬'], ['character', '👤']];

export default function MetaFields({ flags = [], source_url = '', license = '' }: { flags?: string[] | null; source_url?: string | null; license?: string | null }) {
  return (
    <fieldset className="grid gap-2 rounded-xl border border-reef p-3">
      <legend className="px-1 text-sm text-paper/70">أيقونات التحذير للاعب (لا تظهر فيها كلمات)</legend>
      <div className="flex gap-5 text-xl">
        {FLAGS.map(([k, i]) => (
          <label key={k} className="flex items-center gap-1"><input type="checkbox" name="flags" value={k} defaultChecked={flags?.includes(k)} /> <span>{i}</span></label>
        ))}
      </div>
      <input className="input" dir="ltr" name="source_url" placeholder="https://en.wikipedia.org/wiki/... (يُحوَّل إلى QR بعد كشف الإجابة)" defaultValue={source_url ?? ''} />
      <select className="input" name="media_license" defaultValue={license ?? ''}>
        <option value="">— بلا وسيط أو غير محدد (لا يُعرض) —</option>
        <option value="free">🆓 مرخّصة للاستخدام التجاري (CC0 / ملك عام / CC BY مع النسبة)</option>
        <option value="own">✍️ من إنتاجنا</option>
        <option value="restricted">🚫 محمية بحقوق النشر (لا تُعرض)</option>
      </select>
    </fieldset>
  );
}
