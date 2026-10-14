'use client';
import { useState } from 'react';

export default function BuyButton({ plan, packId, label, className = 'btn btn-primary w-full' }: { plan?: 'monthly' | 'yearly'; packId?: string; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function go() {
    setBusy(true); setErr('');
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plan, packId }) });
    if (r.status === 401) { window.location.href = '/login?next=/pricing'; return; }
    const j = await r.json().catch(() => ({}));
    if (j.url) { window.location.href = j.url; return; }
    setErr(j.error ?? 'تعذّر بدء الدفع. حاول مرة أخرى.'); setBusy(false);
  }
  return (
    <div>
      <button className={className} onClick={go} disabled={busy}>{busy ? 'جارٍ التحويل…' : label}</button>
      {err && <p role="alert" className="mt-2 text-sm text-rose">{err}</p>}
    </div>
  );
}
