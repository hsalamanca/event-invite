import { NextResponse } from "next/server";
import { updateEvent } from "@/lib/events";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const slug = session.metadata?.eventSlug;
    if (slug) {
      await updateEvent(slug, {
        tier: "pro",
        showOwnviteFooter: false,
        premiumTheme: true,
      });
    }
  }

  return NextResponse.json({ received: true });
}
