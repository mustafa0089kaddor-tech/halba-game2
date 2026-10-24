/* شعار «حلبة»: مكعّب سداسي ذهبي ثلاثي الأبعاد (نفس روح الأزرار) يحمل حلبة دائرية بحدّ سيان وشرارة ذكاء */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="drop-shadow-[0_4px_10px_rgba(255,138,0,.45)]"
    >
      {/* ظل سفلي يعطي الإحساس بالضغط مثل الزر الذهبي */}
      <path d="M32 8 57 22v28L32 64 7 50V22z" fill="#A65A00" />
      {/* أوجه المكعّب */}
      <path d="M32 2 57 16v28L32 58 7 44V16z" fill="#FFB800" />
      <path d="M32 2 57 16 32 30 7 16z" fill="#FFD05A" />
      <path d="M7 16 32 30v28L7 44z" fill="#FF8A00" />
      {/* الحلبة: حلقة سيان وحلقة بنفسجية متقطعة */}
      <circle cx="32" cy="30" r="15" fill="#160F29" stroke="#00F5D4" strokeWidth="2.5" />
      <circle cx="32" cy="30" r="10" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="3 3.2" />
      {/* شرارة الذكاء */}
      <path d="M32 21.5l2.6 6 6 2.5-6 2.5-2.6 6-2.6-6-6-2.5 6-2.5z" fill="#FFB800" />
    </svg>
  );
}

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="bg-gradient-to-b from-[#FFF3C4] via-saffron to-ember bg-clip-text py-1 font-display text-[1.9rem] font-bold leading-tight text-transparent drop-shadow-[0_2px_0_rgba(120,60,0,.6)] sm:text-3xl">
        حَلْبة
      </span>
    </span>
  );
}
