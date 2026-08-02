import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { findUserByVerifyToken, updateUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }
  const hashed = createHash("sha256").update(token).digest("hex");
  const user = await findUserByVerifyToken(hashed);
  if (!user) {
    return NextResponse.json(
      { error: "Verification link is invalid or expired" },
      { status: 400 },
    );
  }
  await updateUser(user.id, {
    emailVerifiedAt: new Date().toISOString(),
    verifyToken: null,
    verifyTokenExpires: null,
  });
  return NextResponse.json({ ok: true, email: user.email });
}
