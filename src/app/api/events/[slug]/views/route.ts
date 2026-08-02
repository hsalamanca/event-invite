import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import {
  listManualGuests,
  updateManualGuestStatus,
} from "@/lib/guest-extras";
import {
  listViewsByEventId,
  recordInviteView,
  summarizeViews,
} from "@/lib/view-store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() || null;
  const ua = request.headers.get("user-agent");

  await recordInviteView({
    eventId: event.id,
    email,
    userAgent: ua,
  });

  // Soft open-tracking for manual guest list
  if (email) {
    const guests = await listManualGuests(event.id);
    const match = guests.find((g) => g.email === email && g.status === "invited");
    if (match) {
      try {
        await updateManualGuestStatus(match.id, "opened");
      } catch {
        /* optional */
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const views = await listViewsByEventId(event.id);
  const { searchParams } = new URL(_request.url);
  if (searchParams.get("format") === "csv") {
    const rows = [
      ["id", "createdAt", "email", "userAgent"],
      ...views.map((v) => [
        v.id,
        v.createdAt,
        v.email ?? "",
        (v.userAgent ?? "").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c)}"`).join(","))
      .join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-opens.csv"`,
      },
    });
  }

  return NextResponse.json({
    summary: summarizeViews(views),
    recent: views.slice(0, 50),
  });
}
