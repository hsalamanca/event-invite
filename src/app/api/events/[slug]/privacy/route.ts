import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { listAlbumPhotos, listManualGuests, listMessages } from "@/lib/guest-extras";
import { getEventBySlug } from "@/lib/events";
import { listPledges } from "@/lib/gifts";
import {
  deleteRsvpById,
  getRsvpByToken,
  listRsvpsByEventId,
} from "@/lib/rsvp-store";
import { deleteGuestBookContact, listGuestBook } from "@/lib/guest-book";

export const runtime = "nodejs";

/** GDPR-style export for a guest (token) or full host export. */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() || "";
  const scope = searchParams.get("scope") || "guest";

  if (token) {
    const rsvp = await getRsvpByToken(token);
    if (!rsvp || rsvp.eventId !== event.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      export: {
        event: { title: event.title, slug: event.slug },
        rsvp,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  if (scope === "host") {
    const access = await canManageEvent(event);
    if (!access.allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const [rsvps, guests, messages, album, pledges] = await Promise.all([
      listRsvpsByEventId(event.id),
      listManualGuests(event.id),
      listMessages(event.id),
      listAlbumPhotos(event.id, { includePending: true }),
      listPledges(event.id),
    ]);
    return NextResponse.json({
      export: {
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          hostName: event.hostName,
        },
        rsvps,
        guests,
        messages,
        album,
        pledges,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json(
    { error: "Provide token= for guest export or scope=host" },
    { status: 400 },
  );
}

/** Guest delete via edit token, or host erase of a guest email. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    email?: string;
  };

  if (body.token) {
    const rsvp = await getRsvpByToken(body.token);
    if (!rsvp || rsvp.eventId !== event.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await deleteRsvpById(event.id, rsvp.id);
    return NextResponse.json({ ok: true, deleted: "rsvp" });
  }

  const access = await canManageEvent(event);
  if (!access.allowed || !access.session?.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const rsvps = await listRsvpsByEventId(event.id);
  for (const r of rsvps.filter((x) => x.email === email)) {
    await deleteRsvpById(r.id, event.id);
  }

  const book = await listGuestBook(access.session.user.id);
  const contact = book.find((c) => c.email === email);
  if (contact) {
    await deleteGuestBookContact(access.session.user.id, contact.id);
  }

  return NextResponse.json({ ok: true, deleted: email });
}
