import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { heartbeatPresence, listPresence } from "@/lib/collab";
import { getEventBySlug, updateEvent } from "@/lib/events";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const presence = await listPresence(event.id);
  return NextResponse.json({
    presence,
    lastEditedBy: event.lastEditedBy,
    lastEditedAt: event.lastEditedAt,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await canManageEvent(event);
  if (!access.allowed || !access.session?.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    editing?: boolean;
  };
  const name =
    access.session.user.name || access.session.user.email || "Host";
  const presence = await heartbeatPresence({
    eventId: event.id,
    userId: access.session.user.id,
    name,
  });

  if (body.editing) {
    await updateEvent(slug, {
      lastEditedBy: name,
      lastEditedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    presence: presence.filter((p) => p.userId !== access.session!.user!.id),
    self: name,
  });
}
