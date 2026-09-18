/**
 * Guest/print image src allow-list: https or same-origin /api/media.
 * Rejects javascript:, data:, blob:, protocol-relative, and other schemes.
 */
export function safeInviteImageUrl(
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

  if (value.startsWith("/api/media?") || value.startsWith("/api/media/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "https:") return value;
  } catch {
    return undefined;
  }
  return undefined;
}
