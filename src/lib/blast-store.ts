import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { BlastCampaign, OutboundMessage } from "./types";

const PATH = "ownvite/blast-campaigns.json";

type Registry = { version: 1; blasts: BlastCampaign[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, blasts: [] });
}

async function save(reg: Registry) {
  await writeJsonBlob(PATH, reg);
}

export async function createBlast(input: {
  eventId: string;
  type: OutboundMessage["type"];
  channel: BlastCampaign["channel"];
  subject: string;
  recipientCount: number;
  scheduledFor?: string | null;
}): Promise<BlastCampaign> {
  const reg = await load();
  const scheduled = Boolean(input.scheduledFor);
  const blast: BlastCampaign = {
    id: `blt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    eventId: input.eventId,
    type: input.type,
    channel: input.channel,
    subject: input.subject,
    status: scheduled ? "scheduled" : "sent",
    scheduledFor: input.scheduledFor ?? null,
    recipientCount: input.recipientCount,
    createdAt: new Date().toISOString(),
  };
  reg.blasts.unshift(blast);
  await save(reg);
  return blast;
}

export async function listBlastsForEvent(
  eventId: string,
): Promise<BlastCampaign[]> {
  const reg = await load();
  return reg.blasts
    .filter((b) => b.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBlast(
  eventId: string,
  blastId: string,
): Promise<BlastCampaign | undefined> {
  const reg = await load();
  return reg.blasts.find((b) => b.eventId === eventId && b.id === blastId);
}

export function summarizeBlastDelivery(
  messages: OutboundMessage[],
  blastId: string,
) {
  const rows = messages.filter((m) => m.blastId === blastId);
  const sent = rows.filter(
    (m) => m.status === "sent" || m.status === "preview",
  ).length;
  const failed = rows.filter((m) => m.status === "failed").length;
  const opened = rows.filter((m) => m.openedAt).length;
  const clicked = rows.filter((m) => m.clickedAt).length;
  const unopened = rows.filter(
    (m) =>
      (m.status === "sent" || m.status === "preview") &&
      !m.openedAt &&
      m.channel !== "sms" &&
      m.channel !== "whatsapp",
  );
  return {
    total: rows.length,
    sent,
    failed,
    opened,
    clicked,
    unopened,
    recipients: rows,
  };
}
