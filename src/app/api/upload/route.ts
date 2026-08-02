import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

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
      { status: 503 }
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
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 8MB" },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const pathname = `media/${slug || "event"}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Public app URL guests can load without Blob auth headers
  const origin = new URL(request.url).origin;
  const publicUrl = `${origin}/api/media?path=${encodeURIComponent(blob.pathname)}`;

  return NextResponse.json({
    ok: true,
    pathname: blob.pathname,
    url: publicUrl,
    contentType: file.type,
    size: file.size,
  });
}
