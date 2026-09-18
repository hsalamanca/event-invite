import { getPlatformDomains } from "@/lib/dns-instructions";
import {
  addDomainToProject,
  removeDomainFromProject,
  vercelDomainsConfigured,
  verifyProjectDomain,
} from "@/lib/vercel-domains";

/**
 * Register {slug}.ownvite.app + {slug}.ownvite.com on the Vercel project.
 *
 * Platform apex domains already use Vercel nameservers with wildcard TLS
 * (*.ownvite.com / *.ownvite.app). Per-slug registration is kept so each
 * host appears on the project domain list and as a fallback if NS ever
 * leave Vercel DNS.
 */
export async function ensurePlatformSubdomains(slug: string): Promise<{
  ok: boolean;
  hosts: string[];
  results: { host: string; ok: boolean; verified?: boolean; error?: string }[];
}> {
  const clean = slug.trim().toLowerCase();
  if (!clean || clean.includes(".") || clean === "www") {
    return { ok: false, hosts: [], results: [] };
  }

  const { apex, app } = getPlatformDomains();
  const hosts = [`${clean}.${app}`, `${clean}.${apex}`];

  if (!vercelDomainsConfigured()) {
    return {
      ok: false,
      hosts,
      results: hosts.map((host) => ({
        host,
        ok: false,
        error: "Vercel domain API not configured",
      })),
    };
  }

  const results = [];
  for (const host of hosts) {
    const added = await addDomainToProject(host);
    if (!added.ok) {
      results.push({ host, ok: false, error: added.error });
      continue;
    }
    const verified = await verifyProjectDomain(host);
    results.push({
      host,
      ok: true,
      verified: verified.verified || Boolean(added.domain?.verified),
      error: verified.error,
    });
  }

  return {
    ok: results.every((r) => r.ok),
    hosts,
    results,
  };
}

/** Best-effort cleanup when a platform subdomain label is renamed. */
export async function releasePlatformSubdomains(slug: string): Promise<{
  hosts: string[];
  results: { host: string; ok: boolean; error?: string }[];
}> {
  const clean = slug.trim().toLowerCase();
  const { apex, app } = getPlatformDomains();
  const hosts =
    !clean || clean.includes(".") || clean === "www"
      ? []
      : [`${clean}.${app}`, `${clean}.${apex}`];

  if (!hosts.length || !vercelDomainsConfigured()) {
    return {
      hosts,
      results: hosts.map((host) => ({
        host,
        ok: false,
        error: "skipped",
      })),
    };
  }

  const results = [];
  for (const host of hosts) {
    const removed = await removeDomainFromProject(host);
    results.push({
      host,
      ok: removed.ok,
      error: removed.error,
    });
  }
  return { hosts, results };
}
