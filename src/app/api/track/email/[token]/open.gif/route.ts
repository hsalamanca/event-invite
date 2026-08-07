import { markOutboundOpened } from "@/lib/email";
import { updateManualGuestStatus, listManualGuests } from "@/lib/guest-extras";

export const runtime = "nodejs";

/** 1×1 transparent GIF */
const PIXEL = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33,
  249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  try {
    const msg = await markOutboundOpened(token);
    if (msg?.eventId && msg.to) {
      const guests = await listManualGuests(msg.eventId);
      const match = guests.find(
        (g) => g.email.toLowerCase() === msg.to.toLowerCase(),
      );
      if (match && match.status === "invited") {
        await updateManualGuestStatus(match.id, "opened");
      }
    }
  } catch {
    /* never fail the pixel */
  }
  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
