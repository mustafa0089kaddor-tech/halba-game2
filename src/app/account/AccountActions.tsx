'use client';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function AccountActions({ subscriber, isAdmin }: { subscriber: boolean; isAdmin: boolean }) {
  async function portal() {
    const j = await fetch('/api/portal', { method: 'POST' }).then((r) => r.json()).catch(() => ({}));
    if (j.url) window.location.href = j.url; else alert(j.error ?? 'تعذّر فتح بوابة الفواتير');
  }
  async function out() { await supabaseBrowser().auth.signOut(); window.location.href = '/'; }
  return (
    <div className="flex flex-wrap gap-3">
      {subscriber ? <button className="btn btn-ghost" onClick={portal}>إدارة الاشتراك والفواتير</button> : <Link href="/pricing" className="btn btn-primary">اشترك</Link>}
      {isAdmin && <Link href="/admin" className="btn btn-line">لوحة التحكم</Link>}
      <button className="btn btn-line" onClick={out}>تسجيل الخروج</button>
    </div>
  );
}
