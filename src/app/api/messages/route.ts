import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEventBySlug } from "@/lib/events";
import { addMessage, listMessages } from "@/lib/guest-extras";

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

  const messages = await listMessages(event.id);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    body?: string;
  };
  const slug = body.slug?.trim();
  const name = body.name?.trim();
  const text = body.body?.trim();
  if (!slug || !name || !text) {
    return NextResponse.json(
      { error: "slug, name, and body required" },
      { status: 400 },
    );
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await addMessage({
    eventId: event.id,
    name,
    body: text.slice(0, 500),
  });
  return NextResponse.json({ message }, { status: 201 });
}

/** Host-only: reserved for future moderation; currently lists with auth check. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (event.ownerId && event.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
