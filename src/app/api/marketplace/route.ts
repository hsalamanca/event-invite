import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createListing,
  listPublishedListings,
  publishListing,
} from "@/lib/marketplace";
import { TEMPLATES } from "@/lib/templates";
import { findUserById } from "@/lib/users";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const listings = await listPublishedListings();
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const user = await findUserById(session.user.id);
  const studioOk =
    user?.studioStatus === "active" || user?.agencyStatus === "active";
  if (!studioOk && !isAdminEmail(session.user.email)) {
    return NextResponse.json(
      {
        error: "Studio or Agency required to submit marketplace templates",
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    templateId?: string;
    title?: string;
    description?: string;
    priceCents?: number;
    publish?: boolean;
    listingId?: string;
  };

  if (body.publish && body.listingId && isAdminEmail(session.user.email)) {
    const listing = await publishListing(body.listingId);
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ listing });
  }

  const templateId = body.templateId?.trim() || "";
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const listing = await createListing({
    authorId: session.user.id,
    authorName: session.user.name || session.user.email || "Designer",
    templateId,
    title,
    description: body.description || tpl.tagline || "",
    priceCents: body.priceCents ?? 900,
    previewImage: tpl.heroImage,
  });

  // Auto-publish for admins; others pending review
  if (isAdminEmail(session.user.email)) {
    await publishListing(listing.id);
    listing.status = "published";
  }

  return NextResponse.json({ listing }, { status: 201 });
}
