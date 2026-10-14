import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AccountActions from './AccountActions';
import { getEntitlements } from '@/lib/data';
import { hasAdmin } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'حسابي', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Account({ searchParams }: { searchParams: { paid?: string } }) {
  const ent = await getEntitlements();
  if (!ent.userId) redirect('/login?next=/account');
  let finished = 0, wins = 0, ties = 0;
  let recent: { id: string; teams: string[] | null; scores: number[] | null; started_at: string }[] = [];
  if (hasAdmin) {
    const { data } = await supabaseAdmin().from('games').select('id,teams,scores,winner,started_at').eq('user_id', ent.userId).eq('status', 'finished').order('started_at', { ascending: false }).limit(200);
    finished = data?.length ?? 0; ties = (data ?? []).filter((g) => g.winner === -1).length;
    wins = (data ?? []).filter((g) => g.winner === 0).length; // الفريق الأول هو فريق صاحب الحساب افتراضياً
    recent = (data ?? []).slice(0, 5);
  }
  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="font-display text-4xl text-saffron">حسابي</h1>
      {searchParams.paid && <p role="status" className="card text-mint">تم الدفع. قد تستغرق ثوانٍ حتى يظهر اشتراكك.</p>}
      <div className="card"><p className="text-sm text-paper/70">الخطة</p><p className="text-2xl font-bold">{ent.subscriber ? 'مشترك: ألعاب غير محدودة' : 'مجاني'}</p></div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card"><p className="font-display text-4xl">{finished.toLocaleString('ar-EG')}</p><p className="text-sm text-paper/70">ألعاب مكتملة</p></div>
        <div className="card"><p className="font-display text-4xl">{wins.toLocaleString('ar-EG')}</p><p className="text-sm text-paper/70">فوز للفريق الأول</p></div>
        <div className="card"><p className="font-display text-4xl">{ties.toLocaleString('ar-EG')}</p><p className="text-sm text-paper/70">تعادل</p></div>
      </div>
      {recent.length > 0 && (
        <section><h2 className="mb-2 font-bold">آخر الألعاب</h2>
          <ul className="space-y-2">{recent.map((g) => <li key={g.id} className="card !p-3 text-sm">{g.teams?.[0]} {g.scores?.[0]?.toLocaleString('ar-EG')} - {g.scores?.[1]?.toLocaleString('ar-EG')} {g.teams?.[1]}</li>)}</ul></section>
      )}
      <AccountActions subscriber={ent.subscriber} isAdmin={ent.isAdmin} />
    </div>
  );
}
