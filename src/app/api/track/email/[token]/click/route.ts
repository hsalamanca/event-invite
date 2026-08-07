import { NextResponse } from "next/server";
import { markOutboundClicked } from "@/lib/email";
import { listManualGuests, updateManualGuestStatus } from "@/lib/guest-extras";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url") || "/";

  let dest = "/";
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      dest = parsed.toString();
    }
  } catch {
    dest = "/";
  }

  try {
    const msg = await markOutboundClicked(token);
    if (msg?.eventId && msg.to) {
      const guests = await listManualGuests(msg.eventId);
      const match = guests.find(
        (g) => g.email.toLowerCase() === msg.to.toLowerCase(),
      );
      if (match && (match.status === "invited" || match.status === "opened")) {
        await updateManualGuestStatus(match.id, "opened");
      }
    }
  } catch {
    /* continue redirect */
  }

  return NextResponse.redirect(dest, 302);
}
