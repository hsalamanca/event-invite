/** Per-guest check-in QR payload helpers. */

export function encodeCheckInPayload(slug: string, token: string): string {
  return `ownvite:ci:${slug}:${token}`;
}

export function parseCheckInPayload(
  raw: string,
): { slug: string; token: string } | null {
  const text = raw.trim();
  if (!text) return null;

  const coded = text.match(/^ownvite:ci:([^:\s]+):(\S+)$/i);
  if (coded?.[1] && coded[2]) {
    return { slug: coded[1], token: coded[2] };
  }

  try {
    const url = new URL(text);
    const token =
      url.searchParams.get("token") ||
      url.searchParams.get("t") ||
      "";
    const slugMatch = url.pathname.match(/\/e\/([^/]+)/);
    if (token && slugMatch?.[1]) {
      return { slug: slugMatch[1], token };
    }
  } catch {
    /* not a URL */
  }

  // Bare edit token (host paste fallback)
  if (/^[a-zA-Z0-9_-]{8,}$/.test(text)) {
    return { slug: "", token: text };
  }

  return null;
}
