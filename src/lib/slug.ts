/** URL / platform subdomain labels used by Ownvite. */

const RESERVED = new Set([
  "www",
  "api",
  "app",
  "admin",
  "host",
  "e",
  "login",
  "register",
  "signup",
  "signin",
  "pricing",
  "domains",
  "static",
  "cdn",
  "mail",
  "status",
  "support",
  "help",
  "docs",
  "blog",
  "assets",
  "vercel",
  "ownvite",
  "dashboard",
  "studio",
  "billing",
  "webhook",
  "webhooks",
  "rsvp",
  "invite",
  "invites",
]);

export function slugifyLabel(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.trim().toLowerCase());
}

export function validatePlatformSubdomainLabel(
  input: string,
): { ok: true; slug: string } | { ok: false; error: string } {
  const slug = slugifyLabel(input);
  if (!slug || slug.length < 2) {
    return {
      ok: false,
      error: "Use at least 2 letters or numbers (e.g. sandra-30).",
    };
  }
  if (slug.includes(".")) {
    return { ok: false, error: "Enter only the label, not a full domain." };
  }
  if (isReservedSlug(slug)) {
    return { ok: false, error: `"${slug}" is reserved. Try another name.` };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false,
      error: "Use lowercase letters, numbers, and hyphens only.",
    };
  }
  return { ok: true, slug };
}
