import Stripe from "stripe";
import { REMINDER_PACK_CREDITS } from "./tier";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export const PRO_EVENT_CURRENCY = "usd";

export type BillingProduct =
  | "pro_event"
  | "theme_unlock"
  | "reminder_pack"
  | "studio";

export const BILLING_PRODUCTS: Record<
  BillingProduct,
  {
    name: string;
    description: string;
    amountCents: number;
    mode: "payment" | "subscription";
    /** For reminder packs — credits granted on purchase */
    credits?: number;
  }
> = {
  pro_event: {
    name: "Ownvite Pro Event",
    description:
      "Custom domain, premium themes, no footer, check-in, seating, 500-email blasts.",
    amountCents: 2900,
    mode: "payment",
  },
  theme_unlock: {
    name: "Ownvite Premium Theme Unlock",
    description: "Unlock one premium invitation theme for this event.",
    amountCents: 700,
    mode: "payment",
  },
  reminder_pack: {
    name: "Ownvite Reminder Pack",
    description: `${REMINDER_PACK_CREDITS} guest reminder emails for this event.`,
    amountCents: 900,
    mode: "payment",
    credits: REMINDER_PACK_CREDITS,
  },
  studio: {
    name: "Ownvite Studio",
    description:
      "All themes, up to 5 active events, Pro tools on every event, planner workflow.",
    amountCents: 1200,
    mode: "subscription",
  },
};

/** @deprecated use BILLING_PRODUCTS.pro_event.amountCents */
export const PRO_EVENT_AMOUNT_CENTS =
  BILLING_PRODUCTS.pro_event.amountCents;
