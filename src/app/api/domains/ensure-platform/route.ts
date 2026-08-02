import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/auth";
import { getEventBySlug, listEvents } from "@/lib/events";
import { ensurePlatformSubdomains } from "@/lib/platform-subdomains";

export const runtime = "nodejs";

/**
 * Ensure SSL-capable hostnames exist for a slug (or all events).
 * POST { slug?: string, all?: boolean }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    all?: boolean;
  };

  if (body.all) {
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    const events = await listEvents();
    const out = [];
    for (const event of events) {
      out.push({
        slug: event.slug,
        ...(await ensurePlatformSubdomains(event.slug)),
      });
    }
    return NextResponse.json({ ok: true, events: out });
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
  if (!access.allowed && !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await ensurePlatformSubdomains(slug);
  return NextResponse.json(result);
}
