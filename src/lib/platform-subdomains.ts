import { getPlatformDomains } from "@/lib/dns-instructions";
import {
  addDomainToProject,
  vercelDomainsConfigured,
  verifyProjectDomain,
} from "@/lib/vercel-domains";

/**
 * Register {slug}.ownvite.app + {slug}.ownvite.com on the Vercel project so
 * Let's Encrypt can issue per-host certs via HTTP-01.
 *
 * Needed because true wildcard SSL (*.ownvite.com) requires Vercel nameservers
 * (DNS-01). While DNS stays at the registrar with only a * CNAME, each slug
 * must be added individually or browsers show "Not secure".
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
