import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { SITE_URL, hasAdmin } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  if (!hasAdmin || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'الدفع غير مفعّل بعد.' }, { status: 503 });
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ error: 'login' }, { status: 401 });

  const { plan, packId } = (await req.json().catch(() => ({}))) as { plan?: string; packId?: string };
  const db = supabaseAdmin();
  const { data: profile } = await db.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();

  const base: Stripe.Checkout.SessionCreateParams = {
    client_reference_id: user.id,
    success_url: `${SITE_URL}/account?paid=1`,
    cancel_url: `${SITE_URL}/pricing`,
    allow_promotion_codes: true,
    locale: 'ar',
    ...(profile?.stripe_customer_id ? { customer: profile.stripe_customer_id } : { customer_email: user.email ?? undefined }),
  };

  let params: Stripe.Checkout.SessionCreateParams;
  if (plan === 'monthly' || plan === 'yearly') {
    const price = plan === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_YEARLY;
    if (!price) return NextResponse.json({ error: 'الخطة غير مهيأة.' }, { status: 503 });
    params = { ...base, mode: 'subscription', line_items: [{ price, quantity: 1 }], subscription_data: { metadata: { user_id: user.id } } };
  } else if (packId) {
    const { data: pack } = await db.from('packs').select('id,stripe_price_id').eq('id', packId).eq('active', true).maybeSingle();
    if (!pack?.stripe_price_id) return NextResponse.json({ error: 'الباقة غير متاحة.' }, { status: 404 });
    const { data: owned } = await db.from('purchases').select('id').eq('user_id', user.id).eq('pack_id', pack.id).maybeSingle();
    if (owned) return NextResponse.json({ error: 'تملك هذه الباقة بالفعل.' }, { status: 409 });
    params = { ...base, mode: 'payment', line_items: [{ price: pack.stripe_price_id, quantity: 1 }], metadata: { pack_id: pack.id, user_id: user.id } };
  } else return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });

  const session = await stripe().checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
