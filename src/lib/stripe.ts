import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export const PRO_EVENT_AMOUNT_CENTS = 2900;
export const PRO_EVENT_CURRENCY = "usd";
