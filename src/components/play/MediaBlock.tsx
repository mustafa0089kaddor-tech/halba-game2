'use client';
import { useState } from 'react';
import type { Question } from '@/lib/types';

/** أيقونة الحقوق: 🆓 مرخّصة، ✍️ من إنتاجنا. الوسيط غير المعلَّم بأحدهما لا يُعرض أبداً. */
const RIGHTS: Record<string, { i: string; label: string }> = { free: { i: '🆓', label: 'مرخّصة للاستخدام' }, own: { i: '✍️', label: 'من إنتاجنا' } };

function Rights({ license, credit }: { license?: string | null; credit?: string | null }) {
  const r = license ? RIGHTS[license] : undefined;
  if (!r && !credit) return null;
  return (
    <figcaption className="mt-1 flex items-center justify-center gap-2 text-xs text-paper/60">
      {r && <span role="img" aria-label={r.label} className="text-base">{r.i}</span>}
      {credit && <span>{credit}</span>}
    </figcaption>
  );
}

/** يستخرج معرّف فيديو يوتيوب ووقت البدء من أي صيغة رابط شائعة. */
function youtube(u: string): { id: string; start: number } | null {
  try {
    const x = new URL(u);
    const t = (x.searchParams.get('start') ?? x.searchParams.get('t') ?? '0').replace(/s$/, '');
    let id: string | null = null;
    if (x.hostname === 'youtu.be') id = x.pathname.slice(1);
    else if (/(^|\.)youtube(-nocookie)?\.com$/.test(x.hostname)) id = x.searchParams.get('v') ?? x.pathname.split('/').filter(Boolean).pop() ?? null;
    return id && /^[\w-]{11}$/.test(id) ? { id, start: Number(t) || 0 } : null;
  } catch { return null; }
}

export default function MediaBlock({ q }: { q: Question }) {
  const [play, setPlay] = useState(false);
  const [bad, setBad] = useState(false);
  if (!q.media_url || q.type === 'text') return null;
  // حماية الحقوق: لا يُعرض إلا ما عُلِّم بأنه مرخّص أو من إنتاجنا
  if (q.media_license !== 'free' && q.media_license !== 'own') return null;

  if (q.type === 'image') {
    if (bad) return null;
    return (
      <figure className="w-full text-center">
        <img src={q.media_url} alt="" className="mx-auto max-h-64 w-auto max-w-full rounded-xl object-contain" onError={() => setBad(true)} />
        <Rights license={q.media_license} credit={q.media_credit} />
      </figure>
    );
  }
  if (q.type === 'audio') return <figure className="w-full"><audio controls preload="none" src={q.media_url} className="w-full" /><Rights license={q.media_license} credit={q.media_credit} /></figure>;

  const yt = youtube(q.media_url);
  if (yt) {
    return (
      <figure className="w-full">
        {play ? (
          <iframe className="aspect-video w-full rounded-xl" title="فيديو السؤال" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; encrypted-media; picture-in-picture"
            src={`https://www.youtube-nocookie.com/embed/${yt.id}?rel=0&modestbranding=1&playsinline=1&autoplay=1${yt.start ? `&start=${yt.start}` : ''}`} />
        ) : (
          <button className="grid aspect-video w-full place-items-center rounded-xl bg-deep text-4xl hover:bg-night" onClick={() => setPlay(true)} aria-label="تشغيل الفيديو">▶</button>
        )}
        <Rights license={q.media_license} credit={q.media_credit} />
      </figure>
    );
  }
  return <figure className="w-full"><video controls playsInline preload="metadata" src={q.media_url} className="mx-auto max-h-72 w-full rounded-xl" /><Rights license={q.media_license} credit={q.media_credit} /></figure>;
}
