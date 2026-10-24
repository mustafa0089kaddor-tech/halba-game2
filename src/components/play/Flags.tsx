/** أيقونات تحذير فقط، بلا كلمات. العلامات تُضبط من الأدمن لكل سؤال. */
const ICONS: Record<string, string> = { religious: '🕌', film: '🎬', character: '👤' };

export default function Flags({ flags }: { flags?: string[] | null }) {
  const list = (flags ?? []).filter((f) => ICONS[f]);
  if (!list.length) return null;
  return (
    <div className="flex items-center justify-center gap-3" role="group" aria-label="تنبيهات المحتوى">
      {list.map((f) => (
        <span key={f} role="img" aria-label={f}
          className="grid h-12 w-12 place-items-center rounded-full border border-saffron/50 bg-tide/70 text-2xl shadow-[0_0_16px_rgba(255,184,0,.25)] backdrop-blur">
          {ICONS[f]}
        </span>
      ))}
    </div>
  );
}
