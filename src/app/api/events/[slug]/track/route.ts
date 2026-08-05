import { NextResponse } from "next/server";
import { getEventBySlug, updateEvent } from "@/lib/events";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    kind?: "registry" | "cash";
  };
  const kind = body.kind;
  if (kind !== "registry" && kind !== "cash") {
    return NextResponse.json({ error: "kind required" }, { status: 400 });
  }

  const rl = rateLimit({
    key: `track:${clientIp(request)}:${slug}:${kind}`,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: true, limited: true });
  }

  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (kind === "registry") {
    if (!event.registryUrl) {
      return NextResponse.json({ error: "No registry" }, { status: 400 });
    }
    await updateEvent(slug, {
      registryClicks: Math.max(0, event.registryClicks ?? 0) + 1,
    });
  } else {
    if (!event.cashFundUrl) {
      return NextResponse.json({ error: "No cash fund" }, { status: 400 });
    }
    await updateEvent(slug, {
      cashFundClicks: Math.max(0, event.cashFundClicks ?? 0) + 1,
    });
  }

  return NextResponse.json({ ok: true });
}
