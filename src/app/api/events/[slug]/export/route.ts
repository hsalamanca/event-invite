import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import { listManualGuests } from "@/lib/guest-extras";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { listViewsByEventId } from "@/lib/view-store";

export const runtime = "nodejs";

function csvEscape(value: string | number | boolean | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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

  const [rsvps, manual, views] = await Promise.all([
    listRsvpsByEventId(event.id),
    listManualGuests(event.id),
    listViewsByEventId(event.id).catch(() => []),
  ]);

  const lines: string[] = [];
  lines.push("# Ownvite analytics export");
  lines.push(`# Event,${csvEscape(event.title)}`);
  lines.push(`# Slug,${csvEscape(event.slug)}`);
  lines.push(`# Exported,${csvEscape(new Date().toISOString())}`);
  lines.push(`# Invite views,${views.length}`);
  lines.push(`# Registry clicks,${event.registryClicks ?? 0}`);
  lines.push(`# Cash fund clicks,${event.cashFundClicks ?? 0}`);
  lines.push("");
  lines.push(
    [
      "kind",
      "name",
      "email",
      "phone",
      "attendance_or_status",
      "guest_count",
      "dietary",
      "note",
      "meal",
      "checked_in",
      "checked_in_at",
      "created_at",
    ].join(","),
  );

  for (const r of rsvps) {
    lines.push(
      [
        "rsvp",
        csvEscape(r.name),
        csvEscape(r.email),
        csvEscape(r.phone ?? ""),
        csvEscape(r.attendance),
        csvEscape(r.guestCount),
        csvEscape(r.dietary),
        csvEscape(r.note),
        csvEscape(r.mealChoice ?? ""),
        csvEscape(Boolean(r.checkedIn)),
        csvEscape(r.checkedInAt ?? ""),
        csvEscape(r.createdAt),
      ].join(","),
    );
  }
  for (const g of manual) {
    lines.push(
      [
        "manual",
        csvEscape(g.name),
        csvEscape(g.email),
        csvEscape(g.phone ?? ""),
        csvEscape(g.status),
        "",
        "",
        "",
        "",
        "",
        "",
        csvEscape(g.createdAt),
      ].join(","),
    );
  }

  const body = lines.join("\n") + "\n";
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-analytics.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
