import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { OutboundMessage } from "./types";

const PATH = "ownvite/outbound-messages.json";

type Registry = { version: 1; messages: OutboundMessage[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, messages: [] });
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
}): Promise<OutboundMessage> {
  const registry = await load();
  const base: OutboundMessage = {
    id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    type: input.type,
    to: input.to.trim().toLowerCase(),
    subject: input.subject,
    body: input.body,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Ownvite <invites@ownvite.app>";

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
  eventId: string
): Promise<OutboundMessage[]> {
  const registry = await load();
  return registry.messages
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
