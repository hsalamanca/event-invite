import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseInviteText } from "@/lib/ai-invite";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { text?: string };
  try {
    const parsed = await parseInviteText(String(body.text ?? ""));
    return NextResponse.json({
      ok: true,
      parsed,
      engine: process.env.OPENAI_API_KEY ? "openai" : "heuristic",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Could not parse invite",
      },
      { status: 400 },
    );
  }
}
