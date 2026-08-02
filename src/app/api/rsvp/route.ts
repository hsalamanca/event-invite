import { NextResponse } from "next/server";
import { getEventById, getEventBySlug } from "@/lib/events";
import { appendRsvp, listRsvpsByEventId } from "@/lib/rsvp-store";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const eventId = String(data.eventId ?? "");
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const attendance = String(data.attendance ?? "").trim();
  const guestCount = Number(data.guestCount ?? 1);
  const dietary = String(data.dietary ?? "").trim();
  const note = String(data.note ?? "").trim();

  if (!eventId || !name || !email) {
    return NextResponse.json(
      { error: "Name, email, and event are required" },
      { status: 400 }
    );
  }

  const event = await getEventById(eventId);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.capacity) {
    const existing = await listRsvpsByEventId(eventId);
    const going = existing
      .filter((r) => r.attendance.toLowerCase().includes("attend"))
      .reduce((n, r) => n + (r.guestCount || 1), 0);
    const nextCount = attendance.toLowerCase().includes("attend")
      ? Math.max(1, guestCount || 1)
      : 0;
    if (going + nextCount > event.capacity) {
      return NextResponse.json(
        { error: "This event is at capacity" },
        { status: 409 }
      );
    }
  }

  try {
    const record = await appendRsvp({
      eventId,
      name,
      email,
      attendance: attendance || "Joyfully attending",
      guestCount: Number.isFinite(guestCount) ? Math.max(1, guestCount) : 1,
      dietary,
      note,
    });

    return NextResponse.json({ ok: true, rsvp: record }, { status: 201 });
  } catch (err) {
    console.error("RSVP append failed", err);
    return NextResponse.json(
      { error: "Unable to submit RSVP" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const slug = searchParams.get("slug");

  let id = eventId;
  if (!id && slug) {
    id = (await getEventBySlug(slug))?.id ?? null;
  }
  if (!id) {
    return NextResponse.json(
      { error: "eventId or slug required" },
      { status: 400 }
    );
  }

  try {
    const rsvps = await listRsvpsByEventId(id);
    return NextResponse.json({ rsvps });
  } catch (err) {
    console.error("RSVP list failed", err);
    return NextResponse.json(
      { error: "Unable to load RSVPs" },
      { status: 500 }
    );
  }
}
