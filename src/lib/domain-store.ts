import { put } from "@vercel/blob";
import type { DomainBinding, DomainRegistry } from "./domain-types";

const BLOB_PATH = "ownvite/domains.json";

const emptyRegistry = (): DomainRegistry => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  bindings: [],
});

let memoryFallback: DomainRegistry | null = null;
let cached: { at: number; data: DomainRegistry } | null = null;
const CACHE_MS = 15_000;

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob(): Promise<DomainRegistry | null> {
  if (!hasBlobToken()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: BLOB_PATH, limit: 10 });
    const match = result.blobs.find((b) => b.pathname === BLOB_PATH);
    if (!match) return null;
    const res = await fetch(match.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as DomainRegistry;
  } catch {
    return null;
  }
}

async function writeToBlob(registry: DomainRegistry): Promise<void> {
  if (!hasBlobToken()) {
    memoryFallback = registry;
    return;
  }
  await put(BLOB_PATH, JSON.stringify(registry, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  memoryFallback = registry;
  cached = { at: Date.now(), data: registry };
}

export async function getDomainRegistry(
  opts?: { fresh?: boolean }
): Promise<DomainRegistry> {
  if (!opts?.fresh && cached && Date.now() - cached.at < CACHE_MS) {
    return cached.data;
  }

  const fromBlob = await readFromBlob();
  if (fromBlob) {
    cached = { at: Date.now(), data: fromBlob };
    memoryFallback = fromBlob;
    return fromBlob;
  }

  if (memoryFallback) {
    cached = { at: Date.now(), data: memoryFallback };
    return memoryFallback;
  }

  // Seed birthday demo binding for local / first-run
  const seeded = emptyRegistry();
  seeded.bindings.push({
    domain: "h-birthday.ownvite.app",
    slug: "h-birthday-2026",
    eventId: "evt_bday_hsalamanca_2026",
    status: "active",
    connectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vercelVerified: true,
    dns: [
      {
        type: "CNAME",
        host: "h-birthday",
        value: "cname.vercel-dns.com",
      },
    ],
  });
  memoryFallback = seeded;
  cached = { at: Date.now(), data: seeded };
  // Persist seed when blob is available
  if (hasBlobToken()) {
    try {
      await writeToBlob(seeded);
    } catch {
      /* ignore first-run race */
    }
  }
  return seeded;
}

export async function saveDomainRegistry(
  registry: DomainRegistry
): Promise<DomainRegistry> {
  const next = {
    ...registry,
    version: 1 as const,
    updatedAt: new Date().toISOString(),
  };
  await writeToBlob(next);
  return next;
}

export async function getBindingByDomain(
  domain: string
): Promise<DomainBinding | undefined> {
  const registry = await getDomainRegistry();
  const key = domain.toLowerCase();
  return registry.bindings.find((b) => b.domain === key && b.status !== "removed");
}

export async function getBindingBySlug(
  slug: string
): Promise<DomainBinding | undefined> {
  const registry = await getDomainRegistry();
  return registry.bindings.find((b) => b.slug === slug && b.status !== "removed");
}

export async function upsertBinding(
  binding: DomainBinding
): Promise<DomainBinding> {
  const registry = await getDomainRegistry({ fresh: true });
  const domain = binding.domain.toLowerCase();
  const idx = registry.bindings.findIndex((b) => b.domain === domain);
  const next: DomainBinding = {
    ...binding,
    domain,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) registry.bindings[idx] = next;
  else registry.bindings.push(next);
  await saveDomainRegistry(registry);
  return next;
}

export async function removeBinding(domain: string): Promise<void> {
  const registry = await getDomainRegistry({ fresh: true });
  const key = domain.toLowerCase();
  registry.bindings = registry.bindings.map((b) =>
    b.domain === key
      ? {
          ...b,
          status: "removed" as const,
          updatedAt: new Date().toISOString(),
        }
      : b
  );
  await saveDomainRegistry(registry);
}

/** Point all active bindings for an event at a new invite slug. */
export async function rebindSlug(
  oldSlug: string,
  newSlug: string,
  eventId: string,
): Promise<number> {
  if (oldSlug === newSlug) return 0;
  const registry = await getDomainRegistry({ fresh: true });
  let changed = 0;
  registry.bindings = registry.bindings.map((b) => {
    if (b.slug !== oldSlug && b.eventId !== eventId) return b;
    if (b.status === "removed") return b;
    changed += 1;
    return {
      ...b,
      slug: newSlug,
      eventId,
      updatedAt: new Date().toISOString(),
    };
  });
  if (changed > 0) await saveDomainRegistry(registry);
  return changed;
}

export async function domainToSlugMap(): Promise<Record<string, string>> {
  const registry = await getDomainRegistry();
  const map: Record<string, string> = {};
  for (const b of registry.bindings) {
    if (b.status === "active" || b.status === "pending_dns" || b.status === "verifying") {
      map[b.domain] = b.slug;
    }
  }
  return map;
}
