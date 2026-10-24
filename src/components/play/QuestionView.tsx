'use client';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Flags from './Flags';
import MediaBlock from './MediaBlock';
import SourceQr from './SourceQr';
import { ar, type Brand, type Category, type Question } from '@/lib/types';

export interface Aids { double: boolean; fifty: boolean; time: boolean }
export interface TeamState { name: string; score: number; aids: Aids }
type Kind = keyof Aids;

const SECONDS: Record<number, number> = { 200: 30, 400: 45, 600: 60 };
const TEAM_COLORS = ['text-rose', 'text-sky'];
const TEAM_BG = ['bg-rose', 'bg-sky'];
const TEAM_HEX = ['#FF5C8A', '#6EA8FF'];
const TEAM_TOP = ['border-t-rose', 'border-t-sky'];
const TEAM_3D = [
  'shadow-[0_5px_0_#B02A55] active:translate-y-1 active:shadow-[0_1px_0_#B02A55]',
  'shadow-[0_5px_0_#3B6FC4] active:translate-y-1 active:shadow-[0_1px_0_#3B6FC4]',
];

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export default function QuestionView({ q, cat, teams, turn, brand, onAid, onFinish, onClose }: {
  q: Question; cat: Category; teams: TeamState[]; turn: number; brand?: Brand | null;
  onAid: (team: number, kind: Kind) => void;
  onFinish: (winner: number | -1, points: number) => void;
  onClose: () => void;
}) {
  const total = SECONDS[q.points] ?? 45;
  const [left, setLeft] = useState(total);
  const [revealed, setRevealed] = useState(false);
  const [doubleBy, setDoubleBy] = useState<number | null>(null);
  const [fifty, setFifty] = useState<string[] | null>(null);
  const [fb, setFb] = useState<'none' | 'reasons' | 'sent'>('none');

  useEffect(() => {
    if (revealed || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, revealed]);

  const canFifty = useMemo(() => (q.options?.length ?? 0) >= 4, [q]);

  function applyAid(team: number, kind: Kind) {
    if (revealed || !teams[team].aids[kind]) return;
    if (kind === 'fifty') {
      if (!canFifty) return;
      const wrong = shuffle((q.options ?? []).filter((o) => o !== q.answer));
      setFifty(shuffle([q.answer, wrong[0]]));
    }
    if (kind === 'double') setDoubleBy(team);
    if (kind === 'time') setLeft((s) => Math.max(s, 0) + 30);
    onAid(team, kind);
  }

  async function send(kind: 'report' | 'up' | 'down', reason?: string) {
    setFb('sent');
    fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ questionId: q.id, kind, reason }) }).catch(() => {});
  }

  const pct = Math.max(0, left) / total;
  const urgent = left <= 10;
  const R = 44, C = 2 * Math.PI * R;

  return (
    <div className="q-stage fixed inset-0 z-40 overflow-y-auto" role="dialog" aria-modal="true" aria-label="سؤال" data-revealed={revealed}>
      <div className="relative mx-auto flex min-h-full max-w-2xl flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <button className="btn btn-line !px-3 !py-2 text-sm" onClick={onClose} aria-label="إغلاق دون احتساب">إغلاق</button>
          <div className="min-w-0 text-center">
            <p className="truncate font-display text-lg font-extrabold" style={{ color: cat.color }}>{cat.emoji} {cat.name}</p>
            {cat.sponsor && <p className="flex items-center justify-center gap-1 text-xs text-paper/60">برعاية {cat.sponsor.logo_url && <img src={cat.sponsor.logo_url} alt="" className="h-4" />}{cat.sponsor.name}</p>}
            {brand && <p className="text-xs text-paper/60">{brand.name}</p>}
          </div>
          <div className="q-points" data-double={doubleBy !== null}>
            {doubleBy !== null && <em className="q-points__x" aria-hidden>×٢</em>}
            {ar(q.points * (doubleBy !== null ? 2 : 1))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="timer-ring relative h-28 w-28 shrink-0" data-urgent={urgent && !revealed} role="timer" aria-live="off" aria-label={`الوقت المتبقي ${left} ثانية`}>
            <svg viewBox="0 0 100 100" className="-rotate-90">
              <defs>
                <linearGradient id="q-timer-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#FFD05A" /><stop offset="1" stopColor="#FF8A00" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2.2" strokeDasharray="1.2 4.4" />
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(168,85,247,.25)" strokeWidth="8" />
              <circle cx="50" cy="50" r={R} fill="none" stroke={urgent ? '#FF5C8A' : 'url(#q-timer-g)'} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <span className={`timer-num absolute inset-0 grid place-items-center font-display text-4xl font-black tabular-nums ${urgent ? 'text-rose' : ''}`} data-urgent={urgent && !revealed}>{ar(Math.max(0, left))}</span>
          </div>
          <p className="q-turn" style={{ '--team': TEAM_HEX[turn] ?? '#A855F7' } as CSSProperties}>
            {left <= 0 && !revealed ? 'انتهى الوقت. اكشفوا الإجابة.' : <span>الدور على <b className={TEAM_COLORS[turn]}>{teams[turn].name}</b></span>}
          </p>
        </div>

        <div className="q-panel flex flex-1 flex-col">
          <div className="q-panel__inner flex-1">
            <Flags flags={q.flags} />
            <p className="font-display text-2xl font-bold leading-[1.9] sm:text-4xl">{q.question}</p>
            <MediaBlock q={q} />
            {fifty && !revealed && (
              <div className="flex w-full flex-wrap justify-center gap-3" aria-label="خياران متبقيان">
                {fifty.map((o) => <span key={o} className="q-chip">{o}</span>)}
              </div>
            )}
            {revealed && (
              <div className="q-answer">
                <p className="text-sm font-bold text-volt">الإجابة</p>
                <p className="font-display text-3xl font-black leading-snug text-paper sm:text-4xl">{q.answer}</p>
                {q.source && <p className="mt-2 text-xs text-paper/70">المصدر: {q.source}</p>}
              </div>
            )}
            {revealed && q.source_url && <SourceQr url={q.source_url} />}
          </div>
        </div>

        {!revealed ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {teams.map((t, i) => (
                <div key={i} className={`rounded-2xl border border-t-4 border-purple-500/30 bg-tide/50 p-2.5 backdrop-blur ${TEAM_TOP[i] ?? ''}`}>
                  <p className={`mb-2 truncate text-center text-sm font-extrabold ${TEAM_COLORS[i]}`}>{t.name}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button className="ctl-chip !py-2.5 !text-base" disabled={!t.aids.double || doubleBy !== null} onClick={() => applyAid(i, 'double')} title="مضاعفة النقاط">×٢</button>
                    <button className="ctl-chip !py-2.5 !text-base" disabled={!t.aids.fifty || !canFifty || fifty !== null} onClick={() => applyAid(i, 'fifty')} title={canFifty ? 'حذف خيارين' : 'غير متاح لهذا السؤال'}>½</button>
                    <button className="ctl-chip !py-2.5 !text-base" disabled={!t.aids.time} onClick={() => applyAid(i, 'time')} title="وقت إضافي ٣٠ ثانية">+٣٠</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary !py-4 text-xl" onClick={() => setRevealed(true)}>اكشف الإجابة</button>
          </>
        ) : (
          <>
            <p className="text-center font-display text-base font-bold text-paper/80">أي فريق أجاب صح؟</p>
            <div className="grid grid-cols-3 gap-2">
              {teams.map((t, i) => (
                <button key={i} className={`btn ${TEAM_BG[i]} ${TEAM_3D[i]} text-deep`} onClick={() => onFinish(i, q.points * (doubleBy === i ? 2 : 1))}><span className="truncate">{t.name}</span></button>
              ))}
              <button className="btn btn-ghost" onClick={() => onFinish(-1, 0)}>لا أحد</button>
            </div>
            <div className="text-center text-xs text-paper/60">
              {fb === 'none' && <>هل السؤال جيد؟ <button className="mx-1 underline" onClick={() => send('up')}>👍</button><button className="mx-1 underline" onClick={() => send('down')}>👎</button> <button className="underline" onClick={() => setFb('reasons')}>إبلاغ عن خطأ</button></>}
              {fb === 'reasons' && <span className="inline-flex flex-wrap justify-center gap-2">{['إجابة خاطئة', 'سؤال غامض', 'محتوى غير مناسب'].map((r) => <button key={r} className="rounded-lg border border-purple-500/40 px-2 py-1" onClick={() => send('report', r)}>{r}</button>)}</span>}
              {fb === 'sent' && 'شكراً، وصلنا رأيك.'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
