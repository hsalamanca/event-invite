import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug, updateEvent } from "@/lib/events";
import { canUseSeating } from "@/lib/tier";
import type { SeatingTable } from "@/lib/types";

export const runtime = "nodejs";

function normalizeTables(raw: unknown): SeatingTable[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t, i) => {
      const row = t as Partial<SeatingTable>;
      const seats = Math.max(1, Math.min(24, Number(row.seats) || 8));
      const assignments = Array.isArray(row.assignments)
        ? row.assignments
            .filter((a) => a && typeof a.rsvpId === "string")
            .map((a) => ({
              rsvpId: String(a.rsvpId),
              guestName:
                typeof a.guestName === "string" ? a.guestName : undefined,
              seatLabel:
                typeof a.seatLabel === "string" ? a.seatLabel : undefined,
            }))
            .slice(0, seats)
        : [];
      return {
        id:
          typeof row.id === "string" && row.id
            ? row.id
            : `tbl_${Date.now().toString(36)}_${i}`,
        name:
          typeof row.name === "string" && row.name.trim()
            ? row.name.trim()
            : `Table ${i + 1}`,
        seats,
        assignments,
      };
    })
    .slice(0, 40);
}

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
  return NextResponse.json({
    tables: event.seatingTables ?? [],
    pro: canUseSeating(event),
  });
}

export async function PUT(
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
  if (!canUseSeating(event)) {
    return NextResponse.json(
      {
        error: "Seating chart is a Pro Event feature.",
        upgrade: true,
      },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    tables?: unknown;
  };
  const tables = normalizeTables(body.tables);
  const updated = await updateEvent(slug, { seatingTables: tables });
  return NextResponse.json({ ok: true, tables: updated?.seatingTables ?? [] });
}
