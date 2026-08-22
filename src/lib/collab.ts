import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { CollabPresence } from "./types";

const PATH = "ownvite/collab-presence.json";
const TTL_MS = 45_000;

type Registry = { version: 1; presence: CollabPresence[] };

export async function heartbeatPresence(input: {
  eventId: string;
  userId: string;
  name: string;
}): Promise<CollabPresence[]> {
  const reg = await readJsonBlob<Registry>(PATH, {
    version: 1,
    presence: [],
  });
  const now = Date.now();
  const at = new Date(now).toISOString();
  reg.presence = reg.presence.filter(
    (p) =>
      now - new Date(p.at).getTime() < TTL_MS &&
      !(p.eventId === input.eventId && p.userId === input.userId),
  );
  reg.presence.push({
    eventId: input.eventId,
    userId: input.userId,
    name: input.name.trim() || "Host",
    at,
  });
  await writeJsonBlob(PATH, reg);
  return reg.presence.filter((p) => p.eventId === input.eventId);
}

export async function listPresence(
  eventId: string,
): Promise<CollabPresence[]> {
  const reg = await readJsonBlob<Registry>(PATH, {
    version: 1,
    presence: [],
  });
  const now = Date.now();
  return reg.presence.filter(
    (p) =>
      p.eventId === eventId && now - new Date(p.at).getTime() < TTL_MS,
  );
}
