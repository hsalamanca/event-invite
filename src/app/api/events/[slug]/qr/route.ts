import QRCode from "qrcode";
import { getEventBySlug } from "@/lib/events";

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
  const base =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
      : "https://ownvite.com";
  const url = `${base}/e/${event.slug}`;

  if (format === "png") {
    const buf = await QRCode.toBuffer(url, {
      type: "png",
      width: 512,
      margin: 2,
      color: { dark: "#0F1A2E", light: "#FFFFFF" },
    });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${slug}-qr.png"`,
      },
    });
  }

  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: { dark: "#0F1A2E", light: "#FFFFFF" },
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
