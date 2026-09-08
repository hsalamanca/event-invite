import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { withPinnedAuthUrl } from "@/lib/auth-host";

/**
 * On main this file was `export const { GET, POST } = handlers` only.
 * Auth.js v5 still reads process.env.AUTH_URL for Google redirect_uri.
 * If Production AUTH_URL is https://ownvite.app and Hugo starts on
 * ownvite.com, PKCE is set on .com and consumed on .app → InvalidCheck.
 * Pin AUTH_URL to this request's origin for the handler invocation.
 */
export async function GET(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.POST(request));
}
