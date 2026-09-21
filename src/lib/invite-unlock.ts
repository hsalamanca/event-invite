import { createHmac, timingSafeEqual } from "crypto";

export const INVITE_UNLOCK_COOKIE = "OWNVITE_INVITE_UNLOCK";

function signature(slug: string, secret: string): string {
  return createHmac("sha256", secret).update(`invite-unlock:${slug}`).digest("base64url");
}

/** `slug.hmac` so a guest cannot set the cookie to a raw slug. */
export function signUnlockSlug(slug: string, secret: string): string {
  if (!secret) throw new Error("AUTH_SECRET is required to sign invite unlock");
  return `${encodeURIComponent(slug)}.${signature(slug, secret)}`;
}

function tokensEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function unlockCookieGrants(
  cookieValue: string | undefined,
  slug: string,
  secret: string,
): boolean {
  if (!cookieValue || !secret || !slug) return false;
  const expected = signUnlockSlug(slug, secret);
  return cookieValue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => tokensEqual(part, expected));
}

/** Keep other signed slugs and add this one. Unsigned legacy values are dropped. */
export function withUnlockedSlug(
  cookieValue: string | undefined,
  slug: string,
  secret: string,
): string {
  const next = signUnlockSlug(slug, secret);
  const kept = (cookieValue ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => {
      if (!part || part === next) return false;
      const dot = part.lastIndexOf(".");
      if (dot <= 0) return false;
      let existing = part.slice(0, dot);
      try {
        existing = decodeURIComponent(existing);
      } catch {
        return false;
      }
      return unlockCookieGrants(part, existing, secret);
    });
  kept.push(next);
  return kept.join(",");
}
