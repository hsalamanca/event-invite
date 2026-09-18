import { isPlatformAuthHost } from "./auth-host";

export const DEFAULT_CALLBACK_PATH = "/dashboard";

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Same-origin path only — not protocol-relative (`//evil`) or backslash tricks. */
export function isSafeRelativeCallbackPath(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (value.includes("\\")) return false;
  if (value.includes("://")) return false;
  return true;
}

/**
 * Login redirect allowlist: same-origin relative paths, or https URLs on
 * ownvite.com / www.ownvite.com / ownvite.app / www.ownvite.app (and local dev).
 * Event subdomains (*.ownvite.app) are not auth hosts and are rejected.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DEFAULT_CALLBACK_PATH,
): string {
  const value = (raw ?? "").trim();
  if (!value) return fallback;

  if (isSafeRelativeCallbackPath(value)) {
    try {
      const parsed = new URL(value, "https://ownvite.com");
      if (parsed.username || parsed.password) return fallback;
      if (!isSafeRelativeCallbackPath(parsed.pathname) && parsed.pathname !== "/") {
        return fallback;
      }
      const next = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return next || fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const url = new URL(value);
    const local = isLocalDevHost(url.hostname);
    const httpsOk = url.protocol === "https:";
    const httpLocalOk = url.protocol === "http:" && local;
    if (!httpsOk && !httpLocalOk) return fallback;
    if (!isPlatformAuthHost(url.hostname)) return fallback;
    if (url.username || url.password) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

/**
 * Auth.js `callbacks.redirect` — relative paths stay on this origin;
 * `//host` open-redirects are rejected; platform apex/www hosts are allowed
 * so .com ↔ .app login can complete without sending users off-site.
 */
export function safeAuthRedirect(url: string, baseUrl: string): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return baseUrl;

  if (isSafeRelativeCallbackPath(trimmed)) {
    const path = safeCallbackUrl(trimmed, "/");
    if (!isSafeRelativeCallbackPath(path) && path !== "/") return baseUrl;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return baseUrl;
    }
  }

  const allowed = safeCallbackUrl(trimmed, "");
  if (!allowed) return baseUrl;
  if (isSafeRelativeCallbackPath(allowed) || allowed === "/") {
    try {
      return new URL(allowed, baseUrl).toString();
    } catch {
      return baseUrl;
    }
  }
  return allowed;
}

/** Rewrite `callbackUrl` on auth-page 308s so .app → .com cannot preserve an evil URL. */
export function sanitizeCallbackSearch(search: string): string {
  if (!search) return "";
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if (!params.has("callbackUrl")) {
    return search.startsWith("?") ? search : `?${raw}`;
  }
  params.set("callbackUrl", safeCallbackUrl(params.get("callbackUrl")));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
