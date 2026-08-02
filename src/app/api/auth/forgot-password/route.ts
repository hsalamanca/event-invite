import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { appBaseUrl, sendTransactionalEmail } from "@/lib/mail";
import { findUserByEmail, updateUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();

  // Always OK to avoid email enumeration
  if (!email) {
    return NextResponse.json({ ok: true });
  }

  const user = await findUserByEmail(email);
  if (user?.passwordHash) {
    const raw = randomBytes(32).toString("hex");
    const hashed = createHash("sha256").update(raw).digest("hex");
    await updateUser(user.id, {
      resetToken: hashed,
      resetTokenExpires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });
    const url = `${appBaseUrl()}/reset-password?token=${raw}`;
    await sendTransactionalEmail({
      to: email,
      subject: "Reset your Ownvite password",
      body: [
        `Hi ${user.name},`,
        "",
        "Reset your password with this link (expires in 1 hour):",
        url,
        "",
        "If you didn't ask for this, ignore this email.",
        "",
        "— Ownvite",
      ].join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
