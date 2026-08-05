import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { parseCheckInPayload } from "@/lib/check-in-qr";
import { getEventBySlug } from "@/lib/events";
import {
  getRsvpByToken,
  listRsvpsByEventId,
  setCheckedIn,
} from "@/lib/rsvp-store";
import { canUseCheckIn } from "@/lib/tier";

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
      editToken: r.editToken ?? null,
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
  if (!canUseCheckIn(event) && !access.isAdmin) {
    return NextResponse.json(
      {
        error: "Door check-in is included with Pro Event.",
        upgradeRequired: true,
        product: "pro_event",
      },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    rsvpId?: string;
    token?: string;
    code?: string;
    checkedIn?: boolean;
  };
  const checkedIn = body.checkedIn ?? true;

  let rsvpId = body.rsvpId?.trim();
  const rawCode = body.code?.trim() || body.token?.trim() || "";

  if (!rsvpId && rawCode) {
    const parsed = parseCheckInPayload(rawCode);
    const token = parsed?.token || (body.token?.trim() ?? "");
    if (parsed?.slug && parsed.slug !== slug) {
      return NextResponse.json(
        { error: "QR belongs to a different event." },
        { status: 400 },
      );
    }
    if (!token) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }
    const byToken = await getRsvpByToken(token);
    if (!byToken || byToken.eventId !== event.id) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    rsvpId = byToken.id;
  }

  if (!rsvpId || typeof checkedIn !== "boolean") {
    return NextResponse.json(
      { error: "rsvpId or guest QR token required" },
      { status: 400 },
    );
  }

  const updated = await setCheckedIn(rsvpId, checkedIn);
  if (!updated || updated.eventId !== event.id) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }
  return NextResponse.json({ rsvp: updated });
}
