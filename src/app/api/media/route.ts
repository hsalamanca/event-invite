import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

/**
 * Public proxy for private Blob media so <img> / Open Graph work without auth headers.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path || path.includes("..") || !path.startsWith("media/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Media unavailable" }, { status: 503 });
  }

  try {
    const result = await list({
      prefix: path,
      limit: 5,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const match = result.blobs.find((b) => b.pathname === path);
    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const upstream = await fetch(match.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "force-cache",
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media error" }, { status: 500 });
  }
}
