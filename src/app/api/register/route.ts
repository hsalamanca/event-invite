import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { name?: string; email?: string; password?: string };
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const password = String(data.password ?? "");

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Name, email, and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  try {
    const passwordHash = await hash(password, 10);
    const user = await createUser({ email, name, passwordHash });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("register failed", err);
    return NextResponse.json(
      { error: "Could not create account" },
      { status: 500 }
    );
  }
}
