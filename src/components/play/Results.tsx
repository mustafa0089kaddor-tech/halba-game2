'use client';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { ar, type Brand } from '@/lib/types';
import type { TeamState } from './QuestionView';

const CONFETTI_COLORS = ['#FFB800', '#FF8A00', '#00F5D4', '#A855F7', '#FF5C8A', '#6EA8FF', '#F3EEFF'];
/** رقم شبه عشوائي ثابت (لا يتغير بين إعادة الرسم ولا بين الخادم والمتصفح) */
const frac = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const CONFETTI = Array.from({ length: 56 }, (_, i) => ({
  x: `${(frac(i + 1) * 100).toFixed(1)}%`,
  w: `${6 + Math.floor(frac(i + 7) * 6)}px`,
  c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  d: `${(3.2 + frac(i + 13) * 2.8).toFixed(2)}s`,
  delay: `${(frac(i + 21) * 2.4).toFixed(2)}s`,
  drift: `${Math.round((frac(i + 31) - 0.5) * 160)}px`,
  rot: `${Math.round(360 + frac(i + 41) * 720)}deg`,
}));

/** عدّاد يصعد من الصفر إلى النتيجة (بدون حركة إن فضّل المستخدم تقليل الحركة) */
function useCountUp(target: number, ms = 1300): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target <= 0) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function ScoreNum({ value }: { value: number }) {
  const v = useCountUp(value);
  return (
    <p className="team-card__score !animate-none">
      <span aria-hidden>{ar(v)}</span>
      <span className="sr-only">{ar(value)}</span>
    </p>
  );
}

function Trophy({ tie }: { tie: boolean }) {
  if (tie) {
    return <div className="trophy grid h-28 w-28 place-items-center rounded-full border-2 border-saffron/60 bg-tide/70 text-6xl" aria-hidden>🤝</div>;
  }
  return (
    <svg className="trophy h-32 w-28" viewBox="0 0 120 140" aria-hidden focusable="false">
      <defs>
        <linearGradient id="halba-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3C4" /><stop offset=".45" stopColor="#FFB800" /><stop offset="1" stopColor="#FF8A00" />
        </linearGradient>
      </defs>
      <path d="M32 30H14c0 22 9 34 24 38" fill="none" stroke="url(#halba-gold)" strokeWidth="7" strokeLinecap="round" />
      <path d="M88 30h18c0 22-9 34-24 38" fill="none" stroke="url(#halba-gold)" strokeWidth="7" strokeLinecap="round" />
      <path d="M30 14h60v38c0 21-13 36-30 36S30 73 30 52z" fill="url(#halba-gold)" />
      <path d="M38 22h6v30c0 14 5 24 12 30-12-3-18-14-18-30z" fill="#fff" fillOpacity=".3" />
      <path d="M60 33L62.7 40.28L70.46 40.6L64.37 45.42L66.47 52.9L60 48.6L53.53 52.9L55.63 45.42L49.54 40.6L57.3 40.28Z" fill="#7C3AED" fillOpacity=".85" />
      <rect x="53" y="88" width="14" height="18" rx="3" fill="url(#halba-gold)" />
      <path d="M36 108h48l7 18H29z" fill="url(#halba-gold)" />
      <rect x="26" y="124" width="68" height="10" rx="4" fill="#A65A00" />
    </svg>
  );
}

export default function Results({ teams, onAgain, brand }: { teams: TeamState[]; onAgain: () => void; brand?: Brand | null }) {
  const [copied, setCopied] = useState(false);
  const [a, b] = teams;
  const tie = a.score === b.score;
  const win = a.score > b.score ? a : b;
  const text = `انتهت المباراة على «حلبة»: ${a.name} ${ar(a.score)} - ${ar(b.score)} ${b.name}`;

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      if (navigator.share) { await navigator.share({ title: 'حلبة', text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { /* user cancelled */ }
  }

  return (
    <div className="relative flex flex-col items-center gap-6 overflow-hidden pt-6 text-center">
      {!tie && (
        <div className="confetti" aria-hidden>
          {CONFETTI.map((p, i) => (
            <i key={i} style={{ '--x': p.x, '--w': p.w, '--c': p.c, '--d': p.d, '--delay': p.delay, '--drift': p.drift, '--rot': p.rot } as CSSProperties} />
          ))}
        </div>
      )}
      <div className="rays" aria-hidden />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {brand?.logo_url && <img src={brand.logo_url} alt={brand.name} className="h-12" />}
        <Trophy tie={tie} />
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-sm font-bold text-paper/70">النتيجة النهائية</p>
          <h1 className="winner-title text-5xl sm:text-6xl">{tie ? 'تعادل!' : `فاز ${win.name}`}</h1>
          {!tie && <p className="text-paper/75">بفارق {ar(Math.abs(a.score - b.score))} نقطة</p>}
        </div>
      </div>

      <div className="relative z-10 grid w-full max-w-md grid-cols-2 gap-4 pt-5">
        {teams.map((t, i) => {
          const isWin = !tie && t === win;
          return (
            <div key={i} className="team-card" data-active={isWin} style={{ '--team': i === 0 ? '#FF5C8A' : '#6EA8FF' } as CSSProperties}>
              {isWin && <span className="absolute inset-x-0 -top-7 mx-auto w-max text-3xl" aria-hidden>👑</span>}
              <p className={`team-card__name max-w-full truncate ${i === 0 ? 'text-rose' : 'text-sky'}`}>{t.name}</p>
              <ScoreNum value={t.score} />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col gap-3 pb-6">
        <button className="btn btn-primary !py-4 text-lg" onClick={share}>{copied ? 'تم النسخ ✓' : 'شارك النتيجة'}</button>
        <button className="btn btn-ghost" onClick={onAgain}>لعبة جديدة</button>
        <Link href="/pricing" className="text-sm text-paper/70 underline">ألعاب غير محدودة وبدون إعلانات</Link>
      </div>
    </div>
  );
}
