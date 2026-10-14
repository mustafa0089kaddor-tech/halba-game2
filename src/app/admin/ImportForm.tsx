'use client';
import { useState } from 'react';

export default function ImportForm() {
  const [res, setRes] = useState<{ imported?: number; errors?: string[]; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    const r = await fetch('/api/admin/import', { method: 'POST', body: await f.text() });
    setRes(await r.json()); setBusy(false); e.target.value = '';
  }
  return (
    <div className="card">
      <p className="mb-2 text-sm leading-7">الأعمدة بالترتيب: <code dir="ltr" className="rounded bg-deep px-1">category_slug,points,type,question,answer,wrong1,wrong2,wrong3,source,media_url,media_credit,flags,source_url,media_license,status</code><br />media_url: رابط ملف أو يوتيوب، والنوع يُستنتج منه. النقاط: 200 أو 400 أو 600 (مستوى الصعوبة). النوع: text أو image أو audio أو video. الحالة: draft (الافتراضي، لا يظهر للاعبين) أو approved. تُتجاهل الأسئلة المكررة.</p>
      <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={busy} />
      {res && (
        <div className="mt-3 text-sm" role="status">
          {res.error && <p className="text-rose">{res.error}</p>}
          {res.imported !== undefined && <p className="text-mint">تم استيراد {res.imported} سؤال.</p>}
          {res.errors?.map((e) => <p key={e} className="text-saffron">{e}</p>)}
        </div>
      )}
    </div>
  );
}
