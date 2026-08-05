import QRCode from "qrcode";
import { encodeCheckInPayload } from "@/lib/check-in-qr";
import { getEventBySlug } from "@/lib/events";
import { getRsvpByToken } from "@/lib/rsvp-store";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "png" ? "png" : "svg";
  const token = searchParams.get("token")?.trim() || "";
  const base = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : "https://ownvite.com";

  let payload = `${base}/e/${event.slug}`;
  let filename = `${slug}-qr`;

  if (token) {
    const rsvp = await getRsvpByToken(token);
    if (!rsvp || rsvp.eventId !== event.id) {
      return new Response("Guest not found", { status: 404 });
    }
    payload = encodeCheckInPayload(event.slug, token);
    filename = `${slug}-checkin-${rsvp.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "guest"}`;
  }

  if (format === "png") {
    const buf = await QRCode.toBuffer(payload, {
      type: "png",
      width: 512,
      margin: 2,
      color: { dark: "#0F1A2E", light: "#FFFFFF" },
    });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `inline; filename="${filename}.png"`,
      },
    });
  }

  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 2,
    color: { dark: "#0F1A2E", light: "#FFFFFF" },
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=300",
    },
  });
}
