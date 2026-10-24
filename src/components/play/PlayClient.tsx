'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import AdSlot from '@/components/AdSlot';
import { ar, SLOT_POINTS, type Brand, type Category, type Entitlements, type Question } from '@/lib/types';
import QuestionView, { type TeamState } from './QuestionView';
import Results from './Results';
import Setup from './Setup';

type Phase = 'setup' | 'board' | 'results';
const SAVE = 'halba_game_v2';
const SEEN = 'halba_seen_v1';
const readSeen = (): string[] => { try { return JSON.parse(localStorage.getItem(SEEN) ?? '[]'); } catch { return []; } };
const addSeen = (id: string) => { const l = readSeen(); if (!l.includes(id)) { l.push(id); localStorage.setItem(SEEN, JSON.stringify(l.slice(-1200))); } };
const freshTeam = (name: string): TeamState => ({ name: name.trim() || 'فريق', score: 0, aids: { double: true, fifty: true, time: true } });

/** ألوان الفرق وشارات المساعدات المعروضة في لوحة النتائج */
const TEAM_HEX = ['#FF5C8A', '#6EA8FF'];
const TEAM_TEXT = ['text-rose', 'text-sky'];
const AID_CHIPS = [
  { k: 'double', label: '×٢', title: 'مضاعفة النقاط' },
  { k: 'fifty', label: '½', title: 'حذف خيارين' },
  { k: 'time', label: '+٣٠', title: 'وقت إضافي' },
] as const;

export default function PlayClient({ cats, ent, freeDaily, initialCat, brand, orgSlug, unlimited = false }: {
  cats: Category[]; ent: Entitlements; freeDaily: number; initialCat?: string; brand?: Brand | null; orgSlug?: string; unlimited?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [names, setNames] = useState(['الصقور', 'النمور']);
  const [picked, setPicked] = useState<string[]>(() => {
    const c = cats.find((x) => x.slug === initialCat && !x.locked && x.playable);
    return c ? [c.id] : [];
  });
  const [error, setError] = useState('');
  const opened = useRef<string[]>([]);
  const [teams, setTeams] = useState<TeamState[]>([]);
  const [board, setBoard] = useState<Category[]>([]);
  const [done, setDone] = useState<Record<string, number>>({}); // id السؤال -> الفريق الفائز (-1 لا أحد)
  const [turn, setTurn] = useState(0);
  const [active, setActive] = useState<{ q: Question; cat: Category } | null>(null);
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const loaded = useRef(false);

  // استرجاع لعبة جارية بعد إعادة تحميل الصفحة
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(SAVE) ?? 'null');
      if (s?.phase === 'board') { setPhase('board'); setTeams(s.teams); setBoard(s.board); setDone(s.done); setTurn(s.turn); setGameId(s.gameId ?? null); }
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    if (phase === 'board') sessionStorage.setItem(SAVE, JSON.stringify({ phase, teams, board, done, turn, gameId }));
    else sessionStorage.removeItem(SAVE);
  }, [phase, teams, board, done, turn, gameId]);

  async function start() {
    setBusy(true); setError('');
    let id: string | null = null;
    if (!unlimited) {
      if (ent.userId) {
        const r = await fetch('/api/games', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'start', teams: names, cats: picked }) }).then((x) => x.json()).catch(() => ({ allowed: true }));
        if (!r.allowed) { setLimit(true); setBusy(false); return; }
        id = r.id ?? null;
      } else {
        const key = `halba_games_${new Date().toISOString().slice(0, 10)}`;
        const n = Number(localStorage.getItem(key) ?? 0);
        if (n >= freeDaily) { setLimit(true); setBusy(false); return; }
        localStorage.setItem(key, String(n + 1));
      }
    }
    const res = await fetch('/api/draw', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cats: picked, seen: readSeen() }) }).then((x) => x.json()).catch(() => null);
    if (!res?.board?.length) { setError(res?.error ?? 'تعذّر تجهيز الأسئلة. حاول مرة أخرى.'); setBusy(false); return; }
    opened.current = [];
    setGameId(id); setTeams(names.map(freshTeam)); setBoard(res.board); setDone({}); setTurn(0); setPhase('board'); setBusy(false);
  }

  function openQuestion(q: Question, cat: Category) { addSeen(q.id); opened.current.push(q.id); setActive({ q, cat }); }

  function finishQuestion(winner: number, points: number) {
    if (!active) return;
    const nextTeams = teams.map((t, i) => (i === winner ? { ...t, score: t.score + points } : t));
    const nextDone = { ...done, [active.q.id]: winner };
    setTeams(nextTeams); setDone(nextDone); setActive(null); setTurn((t) => 1 - t);
    if (board.flatMap((c) => c.questions).every((q) => q.id in nextDone)) setTimeout(() => finishGame(nextTeams), 400);
  }

  function finishGame(final: TeamState[] = teams) {
    if (ent.userId && gameId) {
      fetch('/api/games', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'finish', id: gameId, scores: final.map((t) => t.score), seen: opened.current }) }).catch(() => {});
    }
    setPhase('results');
  }

  function reset() { setPhase('setup'); setActive(null); setLimit(false); }

  if (phase === 'results') return <Results teams={teams} onAgain={reset} brand={brand} />;

  if (phase === 'setup') {
    return (
      <>
        <Setup cats={cats} names={names} setNames={setNames} picked={picked} setPicked={setPicked} onStart={start} busy={busy} error={error} brand={brand} freeDaily={freeDaily} unlimited={unlimited} subscriber={ent.subscriber} />
        {limit && (
          <div role="alertdialog" aria-label="حد الألعاب" className="fixed inset-0 z-40 grid place-items-center bg-deep/90 p-4 backdrop-blur-sm">
            <div className="card max-w-sm text-center">
              <p className="font-display text-3xl font-black text-saffron">انتهت ألعاب اليوم المجانية</p>
              <p className="my-3 text-paper/80">{ent.userId ? 'اشترك لتلعب بلا حدود وبدون إعلانات، أو عد غداً.' : 'سجّل الدخول للاشتراك، أو عد غداً لألعاب جديدة.'}</p>
              <a href="/pricing" className="btn btn-primary w-full">شاهد الاشتراك</a>
              <button className="btn btn-ghost mt-2 w-full" onClick={() => setLimit(false)}>إغلاق</button>
            </div>
          </div>
        )}
      </>
    );
  }

  const left = board.flatMap((c) => c.questions).filter((q) => !(q.id in done)).length;
  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* لوحة الفرق: الفريق صاحب الدور يتوهج بالسيان */}
      <div className="score-strip sticky top-0 z-10 -mx-4 bg-night/85 px-4 pb-2 pt-4 backdrop-blur-xl">
        {teams.map((t, i) => (
          <div key={i} className="team-card" data-active={turn === i} aria-current={turn === i} style={{ '--team': TEAM_HEX[i] ?? '#A855F7' } as CSSProperties}>
            <span className="team-card__turn absolute inset-x-0 -top-3 mx-auto w-max">دوركم</span>
            <p className={`team-card__name max-w-full truncate ${TEAM_TEXT[i] ?? ''}`}>{t.name}</p>
            <p key={t.score} className="team-card__score">{ar(t.score)}</p>
            <div className="team-card__tools">
              {AID_CHIPS.map((a) => {
                const avail = t.aids[a.k];
                return (
                  <span key={a.k} className={`ctl-chip pointer-events-none ${avail ? '' : 'line-through'}`} data-used={!avail} title={a.title}>
                    <span aria-hidden>{a.label}</span>
                    <span className="sr-only">{a.title}{avail ? '' : ' - مستخدمة'}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* لوحة الأسئلة: ستة أزرار نقاط على سطر واحد لكل فئة */}
      <div className="board-shell" role="grid" aria-label="لوحة الأسئلة">
        {board.map((c) => (
          <div key={c.id} className="board-row">
            <p className="board-row__name" style={{ color: c.color }}>
              <span className="text-2xl" aria-hidden>{c.emoji}</span>
              <span>{c.name}</span>
            </p>
            {SLOT_POINTS.map((p, slot) => {
              const q = c.questions.find((x) => x.slot === slot);
              const w = q ? done[q.id] : undefined;
              const used = w !== undefined;
              const mark: CSSProperties = used
                ? w === 0 ? { color: '#FF5C8A', textShadow: '0 0 12px #FF5C8A' }
                  : w === 1 ? { color: '#6EA8FF', textShadow: '0 0 12px #6EA8FF' }
                  : { color: 'rgba(243,238,255,.4)', textShadow: 'none' }
                : { color: 'rgba(243,238,255,.3)', textShadow: 'none' };
              return (
                <button key={slot} disabled={!q || used} onClick={() => q && openQuestion(q, c)} data-done={used}
                  aria-label={`${c.name} ${p} نقطة${used ? ' - مُجاب' : ''}`}
                  className="pts-btn">
                  {q ? ar(p) : null}
                  {used && <span className="pts-btn__check" style={mark} aria-hidden>{w === -1 ? '–' : '✓'}</span>}
                  {!q && !used && <span className="pts-btn__check" style={mark} aria-hidden>•</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {Object.keys(done).length > 0 && !active && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROUND} />}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="rounded-full border border-purple-500/30 bg-tide/50 px-4 py-1.5 font-bold text-paper/80">متبقي {ar(left)} سؤال</span>
        <button className="btn btn-line !px-4 !py-1.5 text-sm" onClick={() => { if (confirm('إنهاء اللعبة وعرض النتيجة؟')) finishGame(teams); }}>إنهاء اللعبة</button>
      </div>

      {active && (
        <QuestionView key={active.q.id} q={active.q} cat={active.cat} teams={teams} turn={turn} brand={brand}
          onAid={(i, k) => setTeams((ts) => ts.map((t, n) => (n === i ? { ...t, aids: { ...t.aids, [k]: false } } : t)))}
          onFinish={finishQuestion} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
