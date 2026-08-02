import { NextResponse, type NextRequest } from "next/server";
import {
  detectLocaleFromAcceptLanguage,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";

/**
 * - Cookie / Accept-Language locale (no /es URL prefix)
 * - Legacy /es/* → same path without prefix + set Spanish cookie
 * - Custom domain + {slug}.ownvite.app host rewrites
 */

const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ownvite.com",
  "www.ownvite.com",
  "ownvite.app",
  "www.ownvite.app",
]);

type DomainMapResponse = {
  map?: Record<string, string>;
};

function withLocaleCookie(res: NextResponse, locale: Locale) {
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

async function loadDomainMap(
  request: NextRequest
): Promise<Record<string, string>> {
  try {
    const url = new URL("/api/domains/map", request.url);
    const res = await fetch(url.toString(), {
      headers: { "x-ownvite-middleware": "1" },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as DomainMapResponse;
    return data.map ?? {};
  } catch {
    return {};
  }
}

export async function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Legacy /es and /es/... → cookie locale, clean URL
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const stripped =
      pathname === "/es" ? "/" : pathname.replace(/^\/es/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return withLocaleCookie(NextResponse.redirect(url), "es");
  }

  // Ensure a locale cookie exists (first visit: prefer Accept-Language)
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  let response: NextResponse | null = null;

  // Host-based invite routing (custom domains / platform subdomains)
  if (hostname && !PLATFORM_HOSTS.has(hostname)) {
    if (hostname.endsWith(".ownvite.app") || hostname.endsWith(".ownvite.com")) {
      const suffix = hostname.endsWith(".ownvite.app")
        ? ".ownvite.app"
        : ".ownvite.com";
      const slug = hostname.slice(0, -suffix.length);
      if (slug && !slug.includes(".") && slug !== "www") {
        if (pathname === "/" || pathname === "") {
          const url = request.nextUrl.clone();
          url.pathname = `/e/${slug}`;
          response = NextResponse.rewrite(url);
        }
      }
    }

    if (
      !response &&
      hostname.endsWith(".localhost") &&
      (pathname === "/" || pathname === "")
    ) {
      const slug = hostname.replace(/\.localhost$/, "");
      if (slug && !slug.includes(".")) {
        const url = request.nextUrl.clone();
        url.pathname = `/e/${slug}`;
        response = NextResponse.rewrite(url);
      }
    }

    if (!response && (pathname === "/" || pathname === "")) {
      const map = await loadDomainMap(request);
      const slug = map[hostname];
      if (slug) {
        const url = request.nextUrl.clone();
        url.pathname = `/e/${slug}`;
        response = NextResponse.rewrite(url);
      }
    }
  }

  if (!response) {
    response = NextResponse.next();
  }

  if (!isLocale(existing)) {
    const detected =
      detectLocaleFromAcceptLanguage(request.headers.get("accept-language")) ??
      "en";
    withLocaleCookie(response, detected);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
