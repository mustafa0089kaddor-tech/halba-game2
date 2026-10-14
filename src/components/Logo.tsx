export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="#FFC247" />
      <rect x="18" y="20" width="14" height="6" rx="3" fill="#071F27" />
      <rect x="18" y="29" width="22" height="6" rx="3" fill="#071F27" />
      <rect x="18" y="38" width="28" height="6" rx="3" fill="#071F27" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-3xl leading-none text-saffron">حَلْبة</span>
    </span>
  );
}
