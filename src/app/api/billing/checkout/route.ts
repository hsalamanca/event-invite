import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug, listEventsByOwner } from "@/lib/events";
import { appBaseUrl } from "@/lib/mail";
import {
  BILLING_PRODUCTS,
  getStripe,
  type BillingProduct,
  PRO_EVENT_CURRENCY,
} from "@/lib/stripe";
import { getTemplate } from "@/lib/templates";
import { STUDIO_ACTIVE_EVENT_LIMIT } from "@/lib/tier";
import { findUserById } from "@/lib/users";

export const runtime = "nodejs";

function isBillingProduct(value: unknown): value is BillingProduct {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(BILLING_PRODUCTS, value)
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    product?: string;
    templateId?: string;
  };

  const product: BillingProduct = isBillingProduct(body.product)
    ? body.product
    : "pro_event";
  const catalog = BILLING_PRODUCTS[product];
  const sessionAuth = await auth();
  if (!sessionAuth?.user?.email || !sessionAuth.user.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error: "Payments not configured",
        mailto: `mailto:hello@ownvite.com?subject=${encodeURIComponent(catalog.name)}`,
        note: "Set STRIPE_SECRET_KEY to enable checkout, or email hello@ownvite.com.",
      },
      { status: 503 },
    );
  }

  const base = appBaseUrl();

  // Studio is account-level subscription
  if (product === "studio") {
    const user = await findUserById(sessionAuth.user.id);
    if (user?.studioStatus === "active") {
      return NextResponse.json({ ok: true, alreadyStudio: true });
    }
    const owned = await listEventsByOwner(sessionAuth.user.id);
    const active = owned.filter((e) => e.published).length;
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: sessionAuth.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRO_EVENT_CURRENCY,
            unit_amount: catalog.amountCents,
            recurring: { interval: "month" },
            product_data: {
              name: catalog.name,
              description: `${catalog.description} (up to ${STUDIO_ACTIVE_EVENT_LIMIT} active events; you have ${active} published).`,
            },
          },
        },
      ],
      metadata: {
        product: "studio",
        ownerId: sessionAuth.user.id,
        ownerEmail: sessionAuth.user.email,
      },
      subscription_data: {
        metadata: {
          product: "studio",
          ownerId: sessionAuth.user.id,
        },
      },
      success_url: `${base}/dashboard?studio=1`,
      cancel_url: `${base}/pricing?studio=cancelled`,
    });
    return NextResponse.json({ url: checkout.url, id: checkout.id });
  }

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

  if (product === "pro_event") {
    if (event.tier === "pro" || event.tier === "studio") {
      return NextResponse.json({ ok: true, alreadyPro: true });
    }
  }

  let templateId = "";
  let productName = catalog.name;
  let productDescription = catalog.description;

  if (product === "theme_unlock") {
    templateId = String(body.templateId ?? event.templateId ?? "").trim();
    const tpl = getTemplate(templateId);
    if (!tpl?.premium) {
      return NextResponse.json(
        { error: "Choose a premium theme to unlock." },
        { status: 400 },
      );
    }
    if (
      event.tier === "pro" ||
      event.tier === "studio" ||
      event.premiumTheme ||
      (event.unlockedTemplateIds ?? []).includes(templateId)
    ) {
      return NextResponse.json({ ok: true, alreadyUnlocked: true });
    }
    productName = `${catalog.name}: ${tpl.name}`;
    productDescription = `Unlock “${tpl.name}” for “${event.title}”.`;
  }

  const successPath =
    product === "reminder_pack"
      ? `/host/${event.slug}?credits=1`
      : product === "theme_unlock"
        ? `/host/${event.slug}?theme=1`
        : `/host/${event.slug}?upgraded=1`;

  const checkout = await stripe.checkout.sessions.create({
    mode: catalog.mode,
    customer_email: access.session.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: PRO_EVENT_CURRENCY,
          unit_amount: catalog.amountCents,
          product_data: {
            name: productName,
            description: `${productDescription} Event: “${event.title}”.`,
          },
        },
      },
    ],
    metadata: {
      product,
      eventSlug: event.slug,
      eventId: event.id,
      ownerId: event.ownerId ?? "",
      templateId,
      credits: String(catalog.credits ?? 0),
    },
    success_url: `${base}${successPath}`,
    cancel_url: `${base}/host/${event.slug}?upgrade=cancelled`,
  });

  return NextResponse.json({ url: checkout.url, id: checkout.id });
}
