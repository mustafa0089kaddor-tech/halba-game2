'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function MediaField({ name = 'media_url', initial = '' }: { name?: string; initial?: string }) {
  const [url, setUrl] = useState(initial);
  const [state, setState] = useState('');
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setState('جارٍ الرفع…');
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: f.name, contentType: f.type }) });
    const j = await r.json();
    if (!r.ok) { setState(j.error ?? 'فشل الرفع'); return; }
    const { error } = await supabaseBrowser().storage.from('media').uploadToSignedUrl(j.path, j.token, f);
    if (error) { setState(error.message); return; }
    setUrl(j.publicUrl); setState('تم الرفع ✓');
  }
  return (
    <div className="flex flex-col gap-1">
      <input type="hidden" name={name} value={url} />
      <input type="file" accept="image/*,audio/*,video/mp4,video/webm" onChange={pick} className="text-xs" />
      <input className="input !py-2 text-xs" dir="ltr" placeholder="أو الصق رابطاً" value={url} onChange={(e) => setUrl(e.target.value)} />
      {state && <span className="text-xs text-mint">{state}</span>}
    </div>
  );
}
