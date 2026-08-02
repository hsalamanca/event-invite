import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import { appBaseUrl } from "@/lib/mail";
import {
  getStripe,
  PRO_EVENT_AMOUNT_CENTS,
  PRO_EVENT_CURRENCY,
} from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  const slug = String(body.slug ?? "").trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed || !access.session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (event.tier === "pro" || event.tier === "studio") {
    return NextResponse.json({ ok: true, alreadyPro: true });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error: "Payments not configured",
        mailto: "mailto:hello@ownvite.com?subject=Pro%20Event%20upgrade",
        note: "Set STRIPE_SECRET_KEY to enable checkout, or email hello@ownvite.com.",
      },
      { status: 503 },
    );
  }

  const base = appBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: access.session.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: PRO_EVENT_CURRENCY,
          unit_amount: PRO_EVENT_AMOUNT_CENTS,
          product_data: {
            name: "Ownvite Pro Event",
            description: `Upgrade “${event.title}” — custom domain, premium themes, no footer, email blasts.`,
          },
        },
      },
    ],
    metadata: {
      eventSlug: event.slug,
      eventId: event.id,
      ownerId: event.ownerId ?? "",
    },
    success_url: `${base}/host/${event.slug}?upgraded=1`,
    cancel_url: `${base}/host/${event.slug}?upgrade=cancelled`,
  });

  return NextResponse.json({ url: session.url, id: session.id });
}
