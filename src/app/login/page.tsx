'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

function Form() {
  const next = useSearchParams().get('next') ?? '/account';
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const redirect = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function magic(e: React.FormEvent) {
    e.preventDefault(); setState('sending');
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: redirect() } });
    if (error) { setState('error'); setMsg('تعذّر إرسال الرابط. تأكد من البريد وحاول مجدداً.'); } else setState('sent');
  }
  async function google() {
    await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirect() } });
  }

  if (!configured) return <p className="card">تسجيل الدخول غير مفعّل بعد. اضبط متغيرات Supabase في ملف البيئة.</p>;
  return (
    <div className="mx-auto max-w-sm pt-6">
      <h1 className="mb-1 font-display text-4xl text-saffron">الدخول</h1>
      <p className="mb-5 text-sm text-paper/70">لحفظ ألعابك وإحصائياتك والاشتراك. يمكنك اللعب بدون حساب.</p>
      <button className="btn btn-ghost w-full" onClick={google}>المتابعة بحساب غوغل</button>
      <p className="my-4 text-center text-sm text-paper/50">أو</p>
      {state === 'sent' ? (
        <p role="status" className="card text-center">أرسلنا رابط الدخول إلى <b dir="ltr">{email}</b>. افتحه من نفس الجهاز.</p>
      ) : (
        <form onSubmit={magic} className="flex flex-col gap-3">
          <label className="block"><span className="mb-1 block text-sm">البريد الإلكتروني</span>
            <input className="input" dir="ltr" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
          <button className="btn btn-primary" disabled={state === 'sending'}>{state === 'sending' ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول'}</button>
          {state === 'error' && <p role="alert" className="text-sm text-rose">{msg}</p>}
        </form>
      )}
    </div>
  );
}

export default function Login() { return <Suspense><Form /></Suspense>; }
