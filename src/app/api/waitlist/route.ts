import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import {
  addWaitlistEntry,
  deleteWaitlistEntry,
  listWaitlist,
} from "@/lib/guest-extras";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

export const runtime = "nodejs";

async function seatsTaken(eventId: string): Promise<number> {
  const rsvps = await listRsvpsByEventId(eventId);
  return rsvps
    .filter((r) => r.attendance.toLowerCase().includes("attend"))
    .reduce((n, r) => n + (r.guestCount || 1), 0);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const entries = await listWaitlist(event.id);
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    name?: string;
    email?: string;
    guestCount?: number;
    note?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = body.slug?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!slug || !name || !email) {
    return NextResponse.json(
      { error: "slug, name, and email required" },
      { status: 400 },
    );
  }

  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (event.rsvpEnabled === false) {
    return NextResponse.json(
      { error: "RSVP is not enabled for this invitation" },
      { status: 403 },
    );
  }
  if (!event.capacity) {
    return NextResponse.json(
      { error: "This event does not use a waitlist." },
      { status: 400 },
    );
  }

  const taken = await seatsTaken(event.id);
  if (taken < event.capacity) {
    return NextResponse.json(
      { error: "Seats are still open — please RSVP instead." },
      { status: 409 },
    );
  }

  const entry = await addWaitlistEntry({
    eventId: event.id,
    name,
    email,
    guestCount: Number(body.guestCount) || 1,
    note: body.note,
  });
  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const id = searchParams.get("id")?.trim();
  if (!slug || !id) {
    return NextResponse.json(
      { error: "slug and id required" },
      { status: 400 },
    );
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const ok = await deleteWaitlistEntry(event.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
