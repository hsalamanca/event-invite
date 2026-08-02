import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createEvent, getEventBySlug } from "@/lib/events";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { slug } = await context.params;
  const source = await getEventBySlug(slug);
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (source.ownerId && source.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const baseSlug = `${source.slug}-copy`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 40);
  let nextSlug = baseSlug;
  let n = 2;
  while (await getEventBySlug(nextSlug)) {
    nextSlug = `${baseSlug}-${n}`;
    n += 1;
  }

  const created = await createEvent({
    slug: nextSlug,
    ownerId: session.user.id,
    hostName: source.hostName,
    title: `${source.title} (copy)`,
    headline: source.headline,
    tagline: source.tagline,
    dateISO: source.dateISO,
    timeLabel: source.timeLabel,
    venue: source.venue,
    address: source.address,
    theme: source.theme,
    heroImage: source.heroImage,
    customDomain: null,
    rsvpFields: source.rsvpFields,
    about: source.about,
    published: false,
    visibility: source.visibility,
    capacity: source.capacity,
    registryUrl: source.registryUrl,
    templateId: source.templateId,
  });

  return NextResponse.json({ event: created }, { status: 201 });
}
