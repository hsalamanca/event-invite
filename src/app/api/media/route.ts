import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";

/**
 * Public proxy for private Blob media so <img> / Open Graph work without auth headers.
 * Auto-orients EXIF so canvas/postcard captures match on-screen photos.
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
    if (!upstream.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const meta = await sharp(input, { failOn: "none" }).metadata();
    const needsOrient = Boolean(meta.orientation && meta.orientation > 1);

    // Bake EXIF orientation into pixels and strip the tag so Texts/canvas stay upright.
    const oriented = await sharp(input, { failOn: "none", animated: false })
      .rotate()
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    // Permanently rewrite rotated uploads so future requests stay fast/consistent.
    if (needsOrient) {
      try {
        await put(path, oriented, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "image/jpeg",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch {
        // Serving the oriented bytes still succeeds even if rewrite fails.
      }
    }

    return new NextResponse(new Uint8Array(oriented), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        // Not immutable: orientation-fixed bytes must replace older cached copies.
        "Cache-Control": "public, max-age=86400, must-revalidate",
        "X-Image-Oriented": needsOrient ? "1" : "0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media error" }, { status: 500 });
  }
}
