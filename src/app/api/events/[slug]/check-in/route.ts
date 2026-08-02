import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId, setCheckedIn } from "@/lib/rsvp-store";

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
  const rsvps = await listRsvpsByEventId(event.id);
  return NextResponse.json({
    rsvps: rsvps.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      attendance: r.attendance,
      guestCount: r.guestCount,
      checkedIn: Boolean(r.checkedIn),
      checkedInAt: r.checkedInAt ?? null,
    })),
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
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    rsvpId?: string;
    checkedIn?: boolean;
  };
  if (!body.rsvpId || typeof body.checkedIn !== "boolean") {
    return NextResponse.json(
      { error: "rsvpId and checkedIn required" },
      { status: 400 },
    );
  }
  const updated = await setCheckedIn(body.rsvpId, body.checkedIn);
  if (!updated) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }
  return NextResponse.json({ rsvp: updated });
}
