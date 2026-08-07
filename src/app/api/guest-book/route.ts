import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteGuestBookContact,
  listGuestBook,
  upsertGuestBookContact,
} from "@/lib/guest-book";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const contacts = await listGuestBook(session.user.id);
  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    phone?: string;
    dietary?: string;
    householdName?: string;
    notes?: string;
    tags?: string[];
  };
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email required" },
      { status: 400 },
    );
  }
  const contact = await upsertGuestBookContact({
    ownerId: session.user.id,
    name,
    email,
    phone: body.phone,
    dietary: body.dietary,
    householdName: body.householdName,
    notes: body.notes,
    tags: body.tags,
  });
  return NextResponse.json({ contact }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const ok = await deleteGuestBookContact(session.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
