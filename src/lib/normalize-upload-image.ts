import sharp from "sharp";

export type NormalizedUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

/**
 * Bake EXIF orientation into pixel data and strip the orientation tag so
 * browsers, canvas captures, and Texts all show the photo the same way.
 */
export async function normalizeUploadImage(
  input: Buffer,
  mimeType: string,
): Promise<NormalizedUpload> {
  const image = sharp(input, { failOn: "none", animated: false }).rotate();

  if (mimeType === "image/png") {
    const buffer = await image.png({ compressionLevel: 8 }).toBuffer();
    return { buffer, contentType: "image/png", extension: "png" };
  }

  if (mimeType === "image/webp") {
    const buffer = await image.webp({ quality: 88 }).toBuffer();
    return { buffer, contentType: "image/webp", extension: "webp" };
  }

  // GIF and unknown: re-encode as JPEG (orientation-safe, widely supported).
  // Keep true GIF uploads as JPEG after rotate — animated GIFs aren't used as heroes.
  if (mimeType === "image/gif") {
    const buffer = await image.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    return { buffer, contentType: "image/jpeg", extension: "jpg" };
  }

  const buffer = await image.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return { buffer, contentType: "image/jpeg", extension: "jpg" };
}
