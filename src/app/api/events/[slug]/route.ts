import { NextResponse } from "next/server";
import { getEventBySlug, updateEvent } from "@/lib/events";
import type { EventRecord } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const partial = body as Partial<EventRecord>;
  const updated = updateEvent(slug, partial);
  return NextResponse.json({ event: updated });
}
