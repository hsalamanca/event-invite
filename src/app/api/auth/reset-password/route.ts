import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { findUserByResetToken, updateUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };
  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");
  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "Token and a password of at least 8 characters are required" },
      { status: 400 },
    );
  }

  const hashed = createHash("sha256").update(token).digest("hex");
  const user = await findUserByResetToken(hashed);
  if (!user) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 },
    );
  }

  const passwordHash = await hash(password, 10);
  await updateUser(user.id, {
    passwordHash,
    resetToken: null,
    resetTokenExpires: null,
    emailVerifiedAt: user.emailVerifiedAt ?? new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
