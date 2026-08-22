import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { normalizeUploadImage } from "@/lib/normalize-upload-image";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads are not configured" },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const slug = String(form.get("slug") ?? "event").replace(/[^a-z0-9-_]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Use JPG, PNG, WEBP, or GIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 8MB" },
      { status: 400 },
    );
  }

  let normalized;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    normalized = await normalizeUploadImage(input, file.type);
  } catch {
    return NextResponse.json(
      { error: "Could not process that image. Try another photo." },
      { status: 400 },
    );
  }

  const pathname = `media/${slug || "event"}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${normalized.extension}`;

  const blob = await put(pathname, normalized.buffer, {
    access: "private",
    addRandomSuffix: false,
    contentType: normalized.contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Public app URL guests can load without Blob auth headers
  const origin = new URL(request.url).origin;
  const publicUrl = `${origin}/api/media?path=${encodeURIComponent(blob.pathname)}`;

  return NextResponse.json({
    ok: true,
    pathname: blob.pathname,
    url: publicUrl,
    contentType: normalized.contentType,
    size: normalized.buffer.byteLength,
  });
}
