'use client';
import { useEffect, useRef, useState } from 'react';
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
    
    // تم تخطي قيود الحد اليومي مؤقتاً لتسهيل الاختبار
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
          <div role="alertdialog" aria-label="حد الألعاب" className="fixed inset-0 z-40 grid place-items-center bg-deep/90 p-4">
            <div className="card max-w-sm text-center">
              <p className="font-display text-3xl text-saffron">انتهت ألعاب اليوم المجانية</p>
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
      <div className="sticky top-0 z-10 -mx-4 grid grid-cols-2 gap-2 bg-night/95 px-4 py-2 backdrop-blur">
        {teams.map((t, i) => (
          <div key={i} className={`rounded-2xl p-3 text-center transition ${turn === i ? (i === 0 ? 'bg-rose text-deep' : 'bg-sky text-deep') : 'bg-tide/60'}`} aria-current={turn === i}>
            <p className="truncate text-sm font-bold">{t.name}{turn === i && ' · دوركم'}</p>
            <p className="font-display text-4xl leading-none">{ar(t.score)}</p>
            <p className="mt-1 text-xs opacity-80">{[t.aids.double && '×٢', t.aids.fifty && '½', t.aids.time && '+٣٠'].filter(Boolean).join('  ') || 'لا مساعدات'}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3" role="grid" aria-label="لوحة الأسئلة">
        {board.map((c) => (
          <div key={c.id} className="rounded-2xl bg-tide/50 p-3 md:flex md:items-center md:gap-4">
            <p className="mb-2 font-bold md:mb-0 md:w-40 md:shrink-0" style={{ color: c.color }}>{c.emoji} {c.name}</p>
            <div className="grid flex-1 grid-cols-6 gap-1.5">
              {SLOT_POINTS.map((p, slot) => {
                const q = c.questions.find((x) => x.slot === slot);
                const w = q ? done[q.id] : undefined;
                const used = w !== undefined;
                return (
                  <button key={slot} disabled={!q || used} onClick={() => q && openQuestion(q, c)}
                    aria-label={`${c.name} ${p} نقطة${used ? ' - مُجاب' : ''}`}
                    className={`grid h-14 place-items-center rounded-xl font-display text-xl transition ${used ? (w === 0 ? 'bg-rose/25 text-rose' : w === 1 ? 'bg-sky/25 text-sky' : 'bg-deep text-paper/30') : 'bg-saffron text-deep hover:-translate-y-0.5 hover:bg-[#ffd06e]'} disabled:hover:translate-y-0`}>
                    {used ? (w === -1 ? '–' : '✓') : ar(p)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(done).length > 0 && !active && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROUND} />}

      <div className="flex items-center justify-between text-sm text-paper/70">
        <span>متبقي {ar(left)} سؤال</span>
        <button className="underline" onClick={() => { if (confirm('إنهاء اللعبة وعرض النتيجة؟')) finishGame(teams); }}>إنهاء اللعبة</button>
      </div>

      {active && (
        <QuestionView key={active.q.id} q={active.q} cat={active.cat} teams={teams} turn={turn} brand={brand}
          onAid={(i, k) => setTeams((ts) => ts.map((t, n) => (n === i ? { ...t, aids: { ...t.aids, [k]: false } } : t)))}
          onFinish={finishQuestion} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
