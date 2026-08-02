import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import {
  adminDeleteEvent,
  deleteEvent,
  getEventBySlug,
  updateEvent,
} from "@/lib/events";
import type { EventRecord } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { allowed } = await canManageEvent(existing);
  if (!allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const updated = await updateEvent(slug, body as Partial<EventRecord>);
    return NextResponse.json({ event: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const { allowed, isAdmin, session } = await canManageEvent(existing);
  if (!allowed || !session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const ok = isAdmin
    ? await adminDeleteEvent(slug)
    : await deleteEvent(slug, session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
