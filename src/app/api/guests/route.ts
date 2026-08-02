import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import {
  addManualGuest,
  listManualGuests,
  updateManualGuestStatus,
} from "@/lib/guest-extras";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import type { ManualGuest } from "@/lib/types";

export const runtime = "nodejs";

async function assertOwner(slug: string) {
  const event = await getEventBySlug(slug);
  if (!event) {
    return {
      error: NextResponse.json({ error: "Event not found." }, { status: 404 }),
    };
  }
  const { allowed, session } = await canManageEvent(event);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }
  if (!allowed) {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }
  return { session, event };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const gate = await assertOwner(slug);
  if ("error" in gate && gate.error) return gate.error;

  const [rsvps, guests] = await Promise.all([
    listRsvpsByEventId(gate.event.id),
    listManualGuests(gate.event.id),
  ]);

  return NextResponse.json({ rsvps, guests });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    email?: string;
  };
  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const gate = await assertOwner(slug);
  if ("error" in gate && gate.error) return gate.error;

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const guest = await addManualGuest({
    eventId: gate.event.id,
    name,
    email: body.email?.trim() || "",
  });

  return NextResponse.json({ guest }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    id?: string;
    status?: ManualGuest["status"];
  };
  const slug = body.slug?.trim();
  const id = body.id?.trim();
  if (!slug || !id || !body.status) {
    return NextResponse.json(
      { error: "slug, id, and status required" },
      { status: 400 },
    );
  }

  const gate = await assertOwner(slug);
  if ("error" in gate && gate.error) return gate.error;

  const guest = await updateManualGuestStatus(id, body.status);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found." }, { status: 404 });
  }
  return NextResponse.json({ guest });
}
