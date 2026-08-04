import { NextResponse } from "next/server";
import { getEventBySlug, listEventsByOwner, updateEvent } from "@/lib/events";
import { BILLING_PRODUCTS, getStripe } from "@/lib/stripe";
import { REMINDER_PACK_CREDITS } from "@/lib/tier";
import { findUserById, updateUser } from "@/lib/users";

export const runtime = "nodejs";

async function applyStudioToOwnedEvents(ownerId: string) {
  const owned = await listEventsByOwner(ownerId);
  for (const event of owned) {
    await updateEvent(event.slug, {
      tier: "studio",
      showOwnviteFooter: false,
      premiumTheme: true,
    });
  }
}

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
    const product = session.metadata?.product || "pro_event";
    const slug = session.metadata?.eventSlug;
    const ownerId = session.metadata?.ownerId || "";
    const templateId = session.metadata?.templateId || "";

    if (product === "studio" && ownerId) {
      const user = await findUserById(ownerId);
      if (user) {
        await updateUser(user.id, {
          studioStatus: "active",
          studioStripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : user.studioStripeCustomerId,
          studioStripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : user.studioStripeSubscriptionId,
          studioActiveUntil: null,
        });
        await applyStudioToOwnedEvents(ownerId);
      }
    } else if (product === "theme_unlock" && slug && templateId) {
      const existing = await getEventBySlug(slug);
      if (existing) {
        const unlocked = new Set(existing.unlockedTemplateIds ?? []);
        unlocked.add(templateId);
        await updateEvent(slug, {
          unlockedTemplateIds: [...unlocked],
          templateId,
          premiumTheme: true,
        });
      }
    } else if (product === "reminder_pack" && slug) {
      const existing = await getEventBySlug(slug);
      if (existing) {
        const add =
          Number(session.metadata?.credits) ||
          BILLING_PRODUCTS.reminder_pack.credits ||
          REMINDER_PACK_CREDITS;
        await updateEvent(slug, {
          emailCredits: Math.max(0, existing.emailCredits ?? 0) + add,
        });
      }
    } else if (slug) {
      // Default: Pro Event
      await updateEvent(slug, {
        tier: "pro",
        showOwnviteFooter: false,
        premiumTheme: true,
      });
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object;
    const ownerId = sub.metadata?.ownerId;
    if (ownerId) {
      const active = sub.status === "active" || sub.status === "trialing";
      const periodEnd = Number(
        (sub as { current_period_end?: number }).current_period_end ?? 0,
      );
      await updateUser(ownerId, {
        studioStatus: active ? "active" : "canceled",
        studioStripeSubscriptionId: sub.id,
        studioActiveUntil: active
          ? null
          : new Date(periodEnd * 1000).toISOString(),
      });
      if (active) {
        await applyStudioToOwnedEvents(ownerId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
