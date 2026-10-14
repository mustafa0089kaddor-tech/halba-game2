import 'server-only';
import Stripe from 'stripe';

let _s: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  return (_s ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
