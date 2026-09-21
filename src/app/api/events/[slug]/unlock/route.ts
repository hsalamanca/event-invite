import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/events";
import {
  INVITE_UNLOCK_COOKIE,
  withUnlockedSlug,
} from "@/lib/invite-unlock";

export const runtime = "nodejs";

function unlockSecret(): string {
  return process.env.AUTH_SECRET || "";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (event.visibility !== "private" || !event.invitePasswordHash) {
    return NextResponse.json({ ok: true, unlocked: true });
  }

  const body = (await request.json()) as { password?: string };
  const password = String(body.password ?? "");
  const ok = await compare(password, event.invitePasswordHash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const secret = unlockSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Invite unlock is not configured" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true, unlocked: true });
  const existing = request.headers.get("cookie") ?? "";
  const current = existing
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${INVITE_UNLOCK_COOKIE}=`));
  const raw = current
    ? decodeURIComponent(current.slice(INVITE_UNLOCK_COOKIE.length + 1))
    : "";
  res.cookies.set(INVITE_UNLOCK_COOKIE, withUnlockedSlug(raw, slug, secret), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}
