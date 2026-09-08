import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { withPinnedAuthUrl } from "@/lib/auth-host";

/**
 * Auth.js v5 reads process.env.AUTH_URL for Google redirect_uri.
 * Production AUTH_URL is https://ownvite.app; login on ownvite.com would
 * otherwise set PKCE on .com and consume it on .app → InvalidCheck.
 * Pin AUTH_URL to this request's origin for the handler invocation.
 */
export async function GET(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.POST(request));
}
