import { NextResponse } from 'next/server';
import { getEntitlements } from '@/lib/data';
import { hasSupabase } from '@/lib/env';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ent = await getEntitlements();
  let email: string | null = null;
  if (ent.userId && hasSupabase) email = (await supabaseServer().auth.getUser()).data.user?.email ?? null;
  return NextResponse.json({ userId: ent.userId, email, subscriber: ent.subscriber, isAdmin: ent.isAdmin });
}
