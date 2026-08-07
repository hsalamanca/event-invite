import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import { listGuestBook } from "@/lib/guest-book";
import { addManualGuest, listManualGuests } from "@/lib/guest-extras";

export const runtime = "nodejs";

/** Import selected guest-book contacts into an event's manual guest list. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    contactIds?: string[];
    /** When true, import entire guest book */
    all?: boolean;
  };
  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const book = await listGuestBook(session.user.id);
  const selected = body.all
    ? book
    : book.filter((c) => (body.contactIds ?? []).includes(c.id));

  if (selected.length === 0) {
    return NextResponse.json({
      ok: true,
      imported: 0,
      skipped: 0,
      message: "No contacts selected.",
    });
  }

  const existing = await listManualGuests(event.id);
  const have = new Set(
    existing.map((g) => g.email.toLowerCase()).filter(Boolean),
  );

  let imported = 0;
  let skipped = 0;
  for (const c of selected) {
    if (!c.email || have.has(c.email.toLowerCase())) {
      skipped += 1;
      continue;
    }
    await addManualGuest({
      eventId: event.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
    });
    have.add(c.email.toLowerCase());
    imported += 1;
  }

  return NextResponse.json({ ok: true, imported, skipped });
}
