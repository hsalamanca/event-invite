import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { OutboundMessage } from "./types";

const PATH = "ownvite/outbound-messages.json";

type Registry = { version: 1; messages: OutboundMessage[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, messages: [] });
}

function trackingToken() {
  return `trk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Send email via Resend when RESEND_API_KEY is set.
 * Otherwise queues a preview record hosts can copy manually.
 */
export async function sendEventEmail(input: {
  eventId: string;
  type: OutboundMessage["type"];
  to: string;
  subject: string;
  body: string;
  html?: string;
  /** Prefer this so click links can include the tracking token */
  htmlBuilder?: (tracking: {
    token: string;
    trackBaseUrl: string;
  }) => string;
  blastId?: string;
  channel?: OutboundMessage["channel"];
  scheduledFor?: string | null;
}): Promise<OutboundMessage> {
  const registry = await load();
  const token = trackingToken();
  const base: OutboundMessage = {
    id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    type: input.type,
    to: input.to.trim().toLowerCase(),
    subject: input.subject,
    body: input.body,
    status: "queued",
    createdAt: new Date().toISOString(),
    blastId: input.blastId,
    channel: input.channel ?? "email",
    trackingToken: token,
    openedAt: null,
    clickedAt: null,
    scheduledFor: input.scheduledFor ?? null,
  };

  const key = process.env.RESEND_API_KEY || process.env.RESEND_API_Key;
  const from =
    process.env.EMAIL_FROM ||
    process.env.EMAIL_FROM_ADDRESS ||
    "Ownvite <invites@ownvite.app>";

  const platform = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : "https://ownvite.com";

  let html =
    input.htmlBuilder?.({ token, trackBaseUrl: platform }) ?? input.html;
  if (html && input.channel !== "sms" && input.channel !== "whatsapp") {
    const pixel = `<img src="${platform}/api/track/email/${token}/open.gif" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`;
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${pixel}</body>`);
    } else {
      html = `${html}${pixel}`;
    }
  }

  if (!key) {
    const preview: OutboundMessage = { ...base, status: "preview" };
    registry.messages.push(preview);
    try {
      await writeJsonBlob(PATH, registry);
    } catch {
      /* local */
    }
    return preview;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.body,
        ...(html ? { html } : {}),
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      const failed: OutboundMessage = {
        ...base,
        status: "failed",
        error: errText.slice(0, 300),
      };
      registry.messages.push(failed);
      await writeJsonBlob(PATH, registry);
      return failed;
    }
    const sent: OutboundMessage = { ...base, status: "sent" };
    registry.messages.push(sent);
    await writeJsonBlob(PATH, registry);
    return sent;
  } catch (err) {
    const failed: OutboundMessage = {
      ...base,
      status: "failed",
      error: err instanceof Error ? err.message : "send failed",
    };
    registry.messages.push(failed);
    try {
      await writeJsonBlob(PATH, registry);
    } catch {
      /* ignore */
    }
    return failed;
  }
}

export async function listOutboundForEvent(
  eventId: string,
): Promise<OutboundMessage[]> {
  const registry = await load();
  return registry.messages
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findOutboundByTrackingToken(
  token: string,
): Promise<OutboundMessage | undefined> {
  const registry = await load();
  return registry.messages.find((m) => m.trackingToken === token);
}

export async function markOutboundOpened(
  token: string,
): Promise<OutboundMessage | undefined> {
  const registry = await load();
  const idx = registry.messages.findIndex((m) => m.trackingToken === token);
  if (idx < 0) return undefined;
  if (!registry.messages[idx]!.openedAt) {
    registry.messages[idx] = {
      ...registry.messages[idx]!,
      openedAt: new Date().toISOString(),
    };
    await writeJsonBlob(PATH, registry);
  }
  return registry.messages[idx];
}

export async function markOutboundClicked(
  token: string,
): Promise<OutboundMessage | undefined> {
  const registry = await load();
  const idx = registry.messages.findIndex((m) => m.trackingToken === token);
  if (idx < 0) return undefined;
  const now = new Date().toISOString();
  registry.messages[idx] = {
    ...registry.messages[idx]!,
    clickedAt: registry.messages[idx]!.clickedAt ?? now,
    openedAt: registry.messages[idx]!.openedAt ?? now,
  };
  await writeJsonBlob(PATH, registry);
  return registry.messages[idx];
}
