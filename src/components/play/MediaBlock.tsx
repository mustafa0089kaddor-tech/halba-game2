'use client';
import { useState } from 'react';
import type { Question } from '@/lib/types';

/** أيقونة الحقوق: 🆓 مرخّصة، ✍️ من إنتاجنا. الوسيط غير المعلَّم بأحدهما لا يُعرض أبداً. */
const RIGHTS: Record<string, { i: string; label: string }> = { free: { i: '🆓', label: 'مرخّصة للاستخدام' }, own: { i: '✍️', label: 'من إنتاجنا' } };

function Rights({ license, credit }: { license?: string | null; credit?: string | null }) {
  const r = license ? RIGHTS[license] : undefined;
  if (!r && !credit) return null;
  return (
    <figcaption className="mt-2 flex items-center justify-center">
      <span className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-purple-500/30 bg-deep/60 px-3 py-1 text-xs text-paper/70">
        {r && <span role="img" aria-label={r.label} className="text-base">{r.i}</span>}
        {credit && <span>{credit}</span>}
      </span>
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

/**
 * mode='question': الصوت والفيديو فقط (تبقى ظاهرة أثناء السؤال، والصورة محجوبة حتى لا تحرق الإجابة).
 * mode='answer': الصورة فقط (تُعرض عند كشف الإجابة بجانب نص الحل).
 * mode='all' (الافتراضي): كل الوسائط كما كان سابقاً.
 */
export default function MediaBlock({ q, mode = 'all' }: { q: Question; mode?: 'all' | 'question' | 'answer' }) {
  const [play, setPlay] = useState(false);
  const [bad, setBad] = useState(false);
  const [playing, setPlaying] = useState(false);
  if (!q.media_url || q.type === 'text') return null;
  // حماية الحقوق: لا يُعرض إلا ما عُلِّم بأنه مرخّص أو من إنتاجنا
  if (q.media_license !== 'free' && q.media_license !== 'own') return null;
  if (mode === 'question' && q.type === 'image') return null;
  if (mode === 'answer' && q.type !== 'image') return null;

  if (q.type === 'image') {
    if (bad) return null;
    return (
      <figure className="w-full text-center">
        <div className="media-frame">
          <img src={q.media_url} alt="" className="mx-auto max-h-72 w-auto max-w-full rounded-xl object-contain sm:max-h-96" onError={() => setBad(true)} />
        </div>
        <Rights license={q.media_license} credit={q.media_credit} />
      </figure>
    );
  }
  if (q.type === 'audio') {
    return (
      <figure className="w-full">
        <div className="media-frame w-full !p-3" data-playing={playing}>
          <div className="eq" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} style={{ animationDelay: `${(i * 0.11).toFixed(2)}s` }} />)}
          </div>
          <audio controls preload="none" src={q.media_url} className="mt-3 w-full"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        </div>
        <Rights license={q.media_license} credit={q.media_credit} />
      </figure>
    );
  }

  const yt = youtube(q.media_url);
  if (yt) {
    return (
      <figure className="w-full">
        <div className="media-frame w-full">
          {play ? (
            <iframe className="aspect-video w-full rounded-xl" title="فيديو السؤال" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media; picture-in-picture"
              src={`https://www.youtube-nocookie.com/embed/${yt.id}?rel=0&modestbranding=1&playsinline=1&autoplay=1${yt.start ? `&start=${yt.start}` : ''}`} />
          ) : (
            <button type="button" className="media-poster" onClick={() => setPlay(true)} aria-label="تشغيل الفيديو">
              <span className="media-play">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden focusable="false"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          )}
        </div>
        <Rights license={q.media_license} credit={q.media_credit} />
      </figure>
    );
  }
  return (
    <figure className="w-full">
      <div className="media-frame w-full">
        <video controls playsInline preload="metadata" src={q.media_url} className="mx-auto max-h-72 w-full rounded-xl sm:max-h-96" />
      </div>
      <Rights license={q.media_license} credit={q.media_credit} />
    </figure>
  );
}
