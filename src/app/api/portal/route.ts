import { NextResponse } from 'next/server';
import { SITE_URL, hasAdmin } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';

export async function POST() {
  if (!hasAdmin || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'غير مفعّل' }, { status: 503 });
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ error: 'login' }, { status: 401 });
  const { data: p } = await supabaseAdmin().from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
  if (!p?.stripe_customer_id) return NextResponse.json({ error: 'لا يوجد اشتراك' }, { status: 404 });
  const s = await stripe().billingPortal.sessions.create({ customer: p.stripe_customer_id, return_url: `${SITE_URL}/account` });
  return NextResponse.json({ url: s.url });
}
