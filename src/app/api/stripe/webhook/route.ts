import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function saveSub(sub: Stripe.Subscription, userId?: string | null) {
  const db = supabaseAdmin();
  const uid = userId ?? sub.metadata?.user_id;
  if (!uid) return;
  const item = sub.items.data[0];
  const end = (item as unknown as { current_period_end?: number })?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  await db.from('subscriptions').upsert({
    id: sub.id, user_id: uid, status: sub.status, price_id: item?.price.id ?? null,
    interval: item?.price.recurring?.interval ?? null,
    current_period_end: end ? new Date(end * 1000).toISOString() : null, updated_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: 'not configured' }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe().webhooks.constructEvent(await req.text(), sig, secret); }
  catch { return NextResponse.json({ error: 'bad signature' }, { status: 400 }); }

  const db = supabaseAdmin();
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      const uid = s.client_reference_id;
      if (!uid) break;
      if (typeof s.customer === 'string') await db.from('profiles').update({ stripe_customer_id: s.customer }).eq('id', uid);
      if (s.mode === 'payment' && s.metadata?.pack_id && s.payment_status === 'paid') {
        await db.from('purchases').upsert({ user_id: uid, pack_id: s.metadata.pack_id, stripe_session_id: s.id }, { onConflict: 'user_id,pack_id' });
        await db.from('payments').upsert({ user_id: uid, kind: 'pack', amount: s.amount_total ?? 0, currency: s.currency ?? 'usd', stripe_ref: s.id }, { onConflict: 'stripe_ref' });
      }
      if (s.mode === 'subscription' && typeof s.subscription === 'string') await saveSub(await stripe().subscriptions.retrieve(s.subscription), uid);
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await saveSub(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.paid': { // إيراد الاشتراك (الدفعة الأولى والتجديدات)
      const inv = event.data.object as Stripe.Invoice;
      const meta = (inv as unknown as { subscription_details?: { metadata?: Record<string, string> } }).subscription_details?.metadata;
      if (inv.amount_paid > 0) await db.from('payments').upsert({ user_id: meta?.user_id ?? null, kind: 'subscription', amount: inv.amount_paid, currency: inv.currency, stripe_ref: inv.id }, { onConflict: 'stripe_ref' });
      break;
    }
  }
  return NextResponse.json({ received: true });
}
