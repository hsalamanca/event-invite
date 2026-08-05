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
import { getThemePack } from "@/lib/theme-packs";
import { STUDIO_ACTIVE_EVENT_LIMIT } from "@/lib/tier";
import { findUserById } from "@/lib/users";

export const runtime = "nodejs";

function isBillingProduct(value: unknown): value is BillingProduct {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(BILLING_PRODUCTS, value)
  );
}

async function subscriptionCheckout(input: {
  stripe: NonNullable<ReturnType<typeof getStripe>>;
  product: "studio" | "agency";
  userId: string;
  email: string;
  base: string;
}) {
  const catalog = BILLING_PRODUCTS[input.product];
  const user = await findUserById(input.userId);
  if (input.product === "studio" && user?.studioStatus === "active") {
    return NextResponse.json({ ok: true, alreadyStudio: true });
  }
  if (input.product === "agency" && user?.agencyStatus === "active") {
    return NextResponse.json({ ok: true, alreadyAgency: true });
  }

  const owned = await listEventsByOwner(input.userId);
  const active = owned.filter((e) => e.published).length;
  const description =
    input.product === "studio"
      ? `${catalog.description} (up to ${STUDIO_ACTIVE_EVENT_LIMIT} active; you have ${active} published).`
      : catalog.description;

  const checkout = await input.stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: PRO_EVENT_CURRENCY,
          unit_amount: catalog.amountCents,
          recurring: { interval: "month" },
          product_data: {
            name: catalog.name,
            description,
          },
        },
      },
    ],
    metadata: {
      product: input.product,
      ownerId: input.userId,
      ownerEmail: input.email,
    },
    subscription_data: {
      metadata: {
        product: input.product,
        ownerId: input.userId,
      },
    },
    success_url: `${input.base}/dashboard?${input.product}=1`,
    cancel_url: `${input.base}/pricing?${input.product}=cancelled`,
  });
  return NextResponse.json({ url: checkout.url, id: checkout.id });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    product?: string;
    templateId?: string;
    packId?: string;
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

  if (product === "studio" || product === "agency") {
    return subscriptionCheckout({
      stripe,
      product,
      userId: sessionAuth.user.id,
      email: sessionAuth.user.email,
      base,
    });
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
  let packId = "";
  let productName = catalog.name;
  let productDescription = catalog.description;
  let amountCents = catalog.amountCents;

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

  if (product === "theme_pack") {
    packId = String(body.packId ?? "").trim();
    const pack = getThemePack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Unknown theme pack." }, { status: 400 });
    }
    if ((event.unlockedPackIds ?? []).includes(packId)) {
      return NextResponse.json({ ok: true, alreadyUnlocked: true });
    }
    productName = pack.name;
    productDescription = pack.description;
    amountCents = pack.amountCents;
  }

  const successPath =
    product === "reminder_pack"
      ? `/host/${event.slug}?credits=1`
      : product === "sms_pack"
        ? `/host/${event.slug}?sms=1`
        : product === "theme_unlock" || product === "theme_pack"
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
          unit_amount: amountCents,
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
      packId,
      credits: String(catalog.credits ?? 0),
    },
    success_url: `${base}${successPath}`,
    cancel_url: `${base}/host/${event.slug}?upgrade=cancelled`,
  });

  return NextResponse.json({ url: checkout.url, id: checkout.id });
}
