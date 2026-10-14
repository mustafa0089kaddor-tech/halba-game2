'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ar, type Brand } from '@/lib/types';
import type { TeamState } from './QuestionView';

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
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      {brand?.logo_url && <img src={brand.logo_url} alt={brand.name} className="h-12" />}
      <p className="text-paper/70">النتيجة النهائية</p>
      <h1 className="font-display text-5xl text-saffron">{tie ? 'تعادل!' : `فاز ${win.name}`}</h1>
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {teams.map((t, i) => (
          <div key={i} className={`card ${!tie && t === win ? 'ring-2 ring-saffron' : ''}`}>
            <p className={`truncate font-bold ${i === 0 ? 'text-rose' : 'text-sky'}`}>{t.name}</p>
            <p className="font-display text-5xl">{ar(t.score)}</p>
          </div>
        ))}
      </div>
      <div className="flex w-full max-w-md flex-col gap-3">
        <button className="btn btn-primary" onClick={share}>{copied ? 'تم النسخ ✓' : 'شارك النتيجة'}</button>
        <button className="btn btn-ghost" onClick={onAgain}>لعبة جديدة</button>
        <Link href="/pricing" className="text-sm text-paper/70 underline">ألعاب غير محدودة وبدون إعلانات</Link>
      </div>
    </div>
  );
}
