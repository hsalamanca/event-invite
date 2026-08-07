import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { AgencyClient } from "./types";

const PATH = "ownvite/agency-clients.json";

type Registry = { version: 1; clients: AgencyClient[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, clients: [] });
}

async function save(reg: Registry) {
  await writeJsonBlob(PATH, reg);
}

export async function listAgencyClients(
  agencyOwnerId: string,
): Promise<AgencyClient[]> {
  const reg = await load();
  return reg.clients
    .filter((c) => c.agencyOwnerId === agencyOwnerId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAgencyClient(
  agencyOwnerId: string,
  clientId: string,
): Promise<AgencyClient | undefined> {
  const reg = await load();
  return reg.clients.find(
    (c) => c.agencyOwnerId === agencyOwnerId && c.id === clientId,
  );
}

export async function createAgencyClient(input: {
  agencyOwnerId: string;
  name: string;
  email: string;
  notes?: string;
}): Promise<AgencyClient> {
  const reg = await load();
  const client: AgencyClient = {
    id: `cli_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    agencyOwnerId: input.agencyOwnerId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    notes: (input.notes ?? "").trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  reg.clients.push(client);
  await save(reg);
  return client;
}

export async function updateAgencyClient(
  agencyOwnerId: string,
  clientId: string,
  partial: Partial<Pick<AgencyClient, "name" | "email" | "notes">>,
): Promise<AgencyClient | undefined> {
  const reg = await load();
  const idx = reg.clients.findIndex(
    (c) => c.agencyOwnerId === agencyOwnerId && c.id === clientId,
  );
  if (idx < 0) return undefined;
  const current = reg.clients[idx]!;
  reg.clients[idx] = {
    ...current,
    name:
      partial.name != null
        ? String(partial.name).trim() || current.name
        : current.name,
    email:
      partial.email != null
        ? String(partial.email).trim().toLowerCase()
        : current.email,
    notes:
      partial.notes != null
        ? String(partial.notes).trim() || undefined
        : current.notes,
  };
  await save(reg);
  return reg.clients[idx];
}

export async function deleteAgencyClient(
  agencyOwnerId: string,
  clientId: string,
): Promise<boolean> {
  const reg = await load();
  const before = reg.clients.length;
  reg.clients = reg.clients.filter(
    (c) => !(c.agencyOwnerId === agencyOwnerId && c.id === clientId),
  );
  if (reg.clients.length === before) return false;
  await save(reg);
  return true;
}

export function isAgencyActive(user: {
  agencyStatus?: "active" | "canceled" | null;
}): boolean {
  return user.agencyStatus === "active";
}
