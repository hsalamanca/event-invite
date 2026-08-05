import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import {
  addAlbumPhoto,
  deleteAlbumPhoto,
  listAlbumPhotos,
  moderateAlbumPhoto,
} from "@/lib/guest-extras";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { GuestPhoto } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await canManageEvent(event);
  const includePending = access.allowed;
  const photos = await listAlbumPhotos(event.id, { includePending });
  return NextResponse.json({
    photos,
    albumEnabled: Boolean(event.albumEnabled),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    name?: string;
    caption?: string;
    url?: string;
  };
  const slug = body.slug?.trim();
  const name = body.name?.trim() || "Guest";
  const url = body.url?.trim();
  if (!slug || !url) {
    return NextResponse.json(
      { error: "slug and url required" },
      { status: 400 },
    );
  }

  const rl = rateLimit({
    key: `album:${clientIp(request)}:${slug}`,
    limit: 12,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!event.albumEnabled) {
    return NextResponse.json(
      { error: "Guest album is not enabled for this event." },
      { status: 403 },
    );
  }
  if (!url.includes("/api/media?") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const photo = await addAlbumPhoto({
    eventId: event.id,
    name: name.slice(0, 80),
    caption: (body.caption ?? "").slice(0, 280),
    url,
  });
  return NextResponse.json({ photo }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    id?: string;
    status?: GuestPhoto["status"];
  };
  const slug = body.slug?.trim();
  const id = body.id?.trim();
  const status = body.status;
  if (!slug || !id || !status) {
    return NextResponse.json(
      { error: "slug, id, and status required" },
      { status: 400 },
    );
  }
  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const photo = await moderateAlbumPhoto(event.id, id, status);
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }
  return NextResponse.json({ photo });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const id = searchParams.get("id")?.trim();
  if (!slug || !id) {
    return NextResponse.json(
      { error: "slug and id required" },
      { status: 400 },
    );
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const ok = await deleteAlbumPhoto(event.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
