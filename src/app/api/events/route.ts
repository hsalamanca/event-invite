import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createEvent, listEventsByOwner } from "@/lib/events";
import { getRequestLocale } from "@/lib/i18n/locale";
import { buildEventFromTemplate, getTemplate } from "@/lib/templates";
import { STUDIO_ACTIVE_EVENT_LIMIT } from "@/lib/tier";
import { findUserById } from "@/lib/users";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const events = await listEventsByOwner(session.user.id);
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, string>;
  const title = String(data.title ?? "").trim();
  const hostName = String(data.hostName ?? session.user.name ?? "").trim();
  const dateISO = String(data.dateISO ?? "").trim();
  const timeLabel = String(data.timeLabel ?? "7:00 PM").trim();
  const venue = String(data.venue ?? "").trim();
  const address = String(data.address ?? "").trim();
  const about = String(data.about ?? "").trim();
  const templateId = String(data.templateId ?? "evening");
  let slug = String(data.slug ?? "").trim() || slugify(title);

  if (!title || !dateISO || !venue) {
    return NextResponse.json(
      { error: "Title, date, and venue are required" },
      { status: 400 }
    );
  }

  slug = slugify(slug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const locale = await getRequestLocale();
  const user = await findUserById(session.user.id);
  const studioActive = user?.studioStatus === "active";
  if (studioActive) {
    const owned = await listEventsByOwner(session.user.id);
    const active = owned.filter((e) => e.published).length;
    if (active >= STUDIO_ACTIVE_EVENT_LIMIT) {
      return NextResponse.json(
        {
          error: `Studio includes up to ${STUDIO_ACTIVE_EVENT_LIMIT} active events. Unpublish or delete one to create another.`,
          limit: STUDIO_ACTIVE_EVENT_LIMIT,
        },
        { status: 402 },
      );
    }
  }

  const tpl = getTemplate(templateId);
  // Free accounts start on non-premium themes; premium requires unlock/Pro/Studio.
  const safeTemplateId =
    tpl.premium && !studioActive ? "evening" : templateId;

  const base = buildEventFromTemplate({
    templateId: safeTemplateId,
    ownerId: session.user.id,
    hostName: hostName || session.user.name || "Host",
    title,
    slug,
    dateISO,
    timeLabel,
    venue,
    address,
    about:
      about ||
      (locale === "es"
        ? "Me encantaría contar con tu compañía."
        : "I'd love your company — no gifts, just your presence."),
    locale,
  });

  if (studioActive) {
    base.tier = "studio";
    base.showOwnviteFooter = false;
    base.premiumTheme = true;
  }

  try {
    const event = await createEvent(base);
    // Provision {slug}.ownvite.app / .com so HTTPS certs issue (HTTP-01).
    // Wildcard SSL needs Vercel nameservers; per-host add works with * CNAME.
    try {
      const { ensurePlatformSubdomains } = await import(
        "@/lib/platform-subdomains"
      );
      await ensurePlatformSubdomains(event.slug);
    } catch (err) {
      console.error("platform subdomain SSL provision failed", err);
    }
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create event";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
