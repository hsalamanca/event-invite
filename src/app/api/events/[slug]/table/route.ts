import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

export const runtime = "nodejs";

/** Public guest seating lookup by email or edit token. */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!event.guestSeatingEnabled) {
    return NextResponse.json(
      { error: "Guest seating lookup is not enabled for this event" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const token = searchParams.get("token")?.trim() || "";
  if (!email && !token) {
    return NextResponse.json(
      { error: "email or token required" },
      { status: 400 },
    );
  }

  const rsvps = await listRsvpsByEventId(event.id);
  const guest = rsvps.find(
    (r) =>
      (email && r.email.toLowerCase() === email) ||
      (token && r.editToken === token),
  );
  if (!guest) {
    return NextResponse.json(
      { error: "No seating found for that guest yet." },
      { status: 404 },
    );
  }

  const tables = event.seatingTables ?? [];
  for (const table of tables) {
    const seat = table.assignments.find((a) => a.rsvpId === guest.id);
    if (seat) {
      return NextResponse.json({
        ok: true,
        guestName: guest.name,
        tableName: table.name,
        seatLabel: seat.seatLabel || null,
        eventTitle: event.title,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    guestName: guest.name,
    tableName: null,
    seatLabel: null,
    eventTitle: event.title,
    message: "You're on the list — table assignment coming soon.",
  });
}
