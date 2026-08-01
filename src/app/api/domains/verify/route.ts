import { NextResponse } from "next/server";
import { normalizeDomain } from "@/lib/dns-instructions";
import { getBindingByDomain, getBindingBySlug, upsertBinding } from "@/lib/domain-store";
import { verifyProjectDomain } from "@/lib/vercel-domains";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { slug?: string; domain?: string };
  let binding = data.slug ? await getBindingBySlug(data.slug) : null;
  if (!binding && data.domain) {
    binding = (await getBindingByDomain(normalizeDomain(data.domain))) ?? null;
  }
  if (!binding) {
    return NextResponse.json(
      { error: "No domain connected for this event yet" },
      { status: 404 }
    );
  }

  const result = await verifyProjectDomain(binding.domain);
  const verified = Boolean(result.verified);
  const updated = await upsertBinding({
    ...binding,
    status: verified ? "active" : "pending_dns",
    vercelVerified: verified,
    lastCheckedAt: new Date().toISOString(),
    error: verified ? null : result.error ?? "DNS not verified yet — check your records.",
  });

  return NextResponse.json({
    ok: result.ok,
    verified,
    binding: updated,
    vercel: result.domain ?? null,
    message: verified
      ? "Domain is live. Guests can open your custom URL."
      : "Still waiting on DNS. Records can take a few minutes (sometimes up to 24–48h).",
  });
}
