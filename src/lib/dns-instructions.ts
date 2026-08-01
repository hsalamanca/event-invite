import type { DnsRecordInstruction } from "./domain-types";

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "ownvite.com";
const PLATFORM_APP =
  process.env.NEXT_PUBLIC_PLATFORM_APP_DOMAIN ?? "ownvite.app";

/** Stable CNAME target customers should use for subdomains. */
export const OWNVITE_CNAME_TARGET = "cname.vercel-dns.com";

/** Apex A records when someone wants root domain on Ownvite. */
export const OWNVITE_APEX_IPS = ["216.150.1.1", "216.150.16.1"] as const;

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function isValidHostname(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (domain.includes("/") || domain.includes(" ") || domain.includes(":")) {
    return false;
  }
  // Require at least one dot (no bare TLDs / localhost)
  if (!domain.includes(".")) return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
    domain
  );
}

export function isPlatformDomain(domain: string): boolean {
  const d = normalizeDomain(domain);
  return (
    d === PLATFORM_DOMAIN ||
    d === `www.${PLATFORM_DOMAIN}` ||
    d === PLATFORM_APP ||
    d === `www.${PLATFORM_APP}` ||
    d.endsWith(`.${PLATFORM_DOMAIN}`) ||
    d.endsWith(`.${PLATFORM_APP}`)
  );
}

export function isApexDomain(domain: string): boolean {
  const parts = normalizeDomain(domain).split(".");
  // rough: example.com (2) or example.co.uk (3 with known multi-TLD — keep simple)
  return parts.length === 2;
}

export function subdomainLabel(domain: string): string {
  const d = normalizeDomain(domain);
  if (isApexDomain(d)) return "@";
  return d.split(".")[0] ?? "@";
}

/**
 * Customer-facing DNS instructions for pointing a hostname at Ownvite.
 * Subdomains use CNAME; apex uses A records (or ALIAS at supported registrars).
 */
export function buildDnsInstructions(domain: string): DnsRecordInstruction[] {
  const d = normalizeDomain(domain);
  const host = subdomainLabel(d);

  if (isApexDomain(d) || host === "@") {
    return [
      {
        type: "A",
        host: "@",
        value: OWNVITE_APEX_IPS[0],
        note: "Root/apex domain — add both A records if your registrar allows multiple.",
      },
      {
        type: "A",
        host: "@",
        value: OWNVITE_APEX_IPS[1],
        note: "Secondary Ownvite edge IP for redundancy.",
      },
      {
        type: "CNAME",
        host: "www",
        value: OWNVITE_CNAME_TARGET,
        note: "Optional but recommended so www also serves your invite.",
      },
    ];
  }

  return [
    {
      type: "CNAME",
      host,
      value: OWNVITE_CNAME_TARGET,
      note: `Points ${d} at Ownvite. Remove any conflicting A/AAAA records for this host.`,
    },
  ];
}

export function platformInviteUrl(slug: string): string {
  return `https://${PLATFORM_DOMAIN}/e/${slug}`;
}

export function platformSubdomainUrl(slug: string): string {
  return `https://${slug}.${PLATFORM_APP}`;
}

export function getPlatformDomains() {
  return {
    apex: PLATFORM_DOMAIN,
    app: PLATFORM_APP,
    cnameTarget: OWNVITE_CNAME_TARGET,
  };
}
