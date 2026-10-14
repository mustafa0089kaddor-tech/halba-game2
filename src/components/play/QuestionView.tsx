'use client';
import { useEffect, useMemo, useState } from 'react';
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
    <div className="fixed inset-0 z-40 overflow-y-auto bg-deep" role="dialog" aria-modal="true" aria-label="سؤال">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <button className="btn btn-line !px-3 !py-2 text-sm" onClick={onClose} aria-label="إغلاق دون احتساب">إغلاق</button>
          <div className="text-center">
            <p className="font-bold" style={{ color: cat.color }}>{cat.emoji} {cat.name}</p>
            {cat.sponsor && <p className="flex items-center justify-center gap-1 text-xs text-paper/60">برعاية {cat.sponsor.logo_url && <img src={cat.sponsor.logo_url} alt="" className="h-4" />}{cat.sponsor.name}</p>}
            {brand && <p className="text-xs text-paper/60">{brand.name}</p>}
          </div>
          <div className="rounded-xl bg-saffron px-3 py-1 font-display text-2xl text-deep">{ar(q.points * (doubleBy !== null ? 2 : 1))}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0" role="timer" aria-live="off" aria-label={`الوقت المتبقي ${left} ثانية`}>
            <svg viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="#10495A" strokeWidth="8" />
              <circle cx="50" cy="50" r={R} fill="none" stroke={urgent ? '#FF6B8B' : '#FFC247'} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <span className={`absolute inset-0 grid place-items-center font-display text-3xl ${urgent ? 'text-rose' : ''}`}>{ar(Math.max(0, left))}</span>
          </div>
          <p className="text-sm text-paper/70">{left <= 0 && !revealed ? 'انتهى الوقت. اكشفوا الإجابة.' : <>الدور على <b className={TEAM_COLORS[turn]}>{teams[turn].name}</b></>}</p>
        </div>

        <div className="card flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Flags flags={q.flags} />
          <p className="text-2xl font-bold leading-[1.9] sm:text-3xl">{q.question}</p>
          <MediaBlock q={q} />
          {fifty && !revealed && (
            <div className="flex w-full flex-wrap justify-center gap-2" aria-label="خياران متبقيان">
              {fifty.map((o) => <span key={o} className="rounded-xl border border-saffron px-4 py-2 font-bold text-saffron">{o}</span>)}
            </div>
          )}
          {revealed && <div className="w-full rounded-xl bg-mint/15 p-4"><p className="text-sm text-mint">الإجابة</p><p className="text-2xl font-bold text-mint">{q.answer}</p>{q.source && <p className="mt-2 text-xs text-paper/70">المصدر: {q.source}</p>}</div>}
          {revealed && q.source_url && <SourceQr url={q.source_url} />}
        </div>

        {!revealed ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {teams.map((t, i) => (
                <div key={i} className="rounded-xl bg-tide/60 p-2">
                  <p className={`mb-1 truncate text-center text-sm font-bold ${TEAM_COLORS[i]}`}>{t.name}</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button className="btn btn-ghost !p-2 text-sm" disabled={!t.aids.double || doubleBy !== null} onClick={() => applyAid(i, 'double')} title="مضاعفة النقاط">×٢</button>
                    <button className="btn btn-ghost !p-2 text-sm" disabled={!t.aids.fifty || !canFifty || fifty !== null} onClick={() => applyAid(i, 'fifty')} title={canFifty ? 'حذف خيارين' : 'غير متاح لهذا السؤال'}>½</button>
                    <button className="btn btn-ghost !p-2 text-sm" disabled={!t.aids.time} onClick={() => applyAid(i, 'time')} title="وقت إضافي ٣٠ ثانية">+٣٠</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary text-lg" onClick={() => setRevealed(true)}>اكشف الإجابة</button>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-paper/70">أي فريق أجاب صح؟</p>
            <div className="grid grid-cols-3 gap-2">
              {teams.map((t, i) => (
                <button key={i} className={`btn ${TEAM_BG[i]} text-deep`} onClick={() => onFinish(i, q.points * (doubleBy === i ? 2 : 1))}><span className="truncate">{t.name}</span></button>
              ))}
              <button className="btn btn-ghost" onClick={() => onFinish(-1, 0)}>لا أحد</button>
            </div>
            <div className="text-center text-xs text-paper/60">
              {fb === 'none' && <>هل السؤال جيد؟ <button className="mx-1 underline" onClick={() => send('up')}>👍</button><button className="mx-1 underline" onClick={() => send('down')}>👎</button> <button className="underline" onClick={() => setFb('reasons')}>إبلاغ عن خطأ</button></>}
              {fb === 'reasons' && <span className="inline-flex flex-wrap justify-center gap-2">{['إجابة خاطئة', 'سؤال غامض', 'محتوى غير مناسب'].map((r) => <button key={r} className="rounded-lg border border-reef px-2 py-1" onClick={() => send('report', r)}>{r}</button>)}</span>}
              {fb === 'sent' && 'شكراً، وصلنا رأيك.'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
