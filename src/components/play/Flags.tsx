/** أيقونات تحذير فقط، بلا كلمات. العلامات تُضبط من الأدمن لكل سؤال. */
const ICONS: Record<string, string> = { religious: '🕌', film: '🎬', character: '👤' };

export default function Flags({ flags }: { flags?: string[] | null }) {
  const list = (flags ?? []).filter((f) => ICONS[f]);
  if (!list.length) return null;
  return (
    <div className="flex items-center justify-center gap-3 text-3xl" role="group" aria-label="تنبيهات المحتوى">
      {list.map((f) => <span key={f} role="img" aria-label={f}>{ICONS[f]}</span>)}
    </div>
  );
}
