import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/events";

export const runtime = "nodejs";

const COOKIE = "OWNVITE_INVITE_UNLOCK";

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

  const res = NextResponse.json({ ok: true, unlocked: true });
  const existing = request.headers.get("cookie") ?? "";
  const unlocked = new Set(
    existing
      .split(";")
      .map((c) => c.trim())
      .filter((c) => c.startsWith(`${COOKIE}=`))
      .flatMap((c) => decodeURIComponent(c.slice(COOKIE.length + 1)).split(","))
      .filter(Boolean),
  );
  unlocked.add(slug);
  res.cookies.set(COOKIE, [...unlocked].join(","), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}
