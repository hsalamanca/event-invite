/**
 * Guest-facing outbound link allow-list: https only.
 * Rejects javascript:, data:, blob:, relative, and protocol-relative URLs.
 */
export function safeHttpsUrl(
  raw: string | null | undefined,
): string | undefined {
  const value = (raw ?? "").trim();
  if (!value) return undefined;

  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return undefined;
  }

  if (value.startsWith("/") || value.startsWith("\\")) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return undefined;
    if (url.username || url.password) return undefined;
    if (!url.hostname) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
