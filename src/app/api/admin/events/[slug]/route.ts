import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  adminDeleteEvent,
  getEventBySlug,
  updateEvent,
} from "@/lib/events";
import type { EventRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Support assist: limited fields from admin UI
  const data = body as Partial<EventRecord> & { transferOwnerId?: string };
  const patch: Partial<EventRecord> = {};
  if (typeof data.published === "boolean") patch.published = data.published;
  if (data.visibility === "public" || data.visibility === "unlisted") {
    patch.visibility = data.visibility;
  }
  if (typeof data.title === "string") patch.title = data.title.trim();
  if (data.transferOwnerId !== undefined) {
    patch.ownerId = data.transferOwnerId || null;
  }

  try {
    const updated = await updateEvent(slug, patch);
    return NextResponse.json({ event: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { slug } = await params;
  const ok = await adminDeleteEvent(slug);
  if (!ok) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
