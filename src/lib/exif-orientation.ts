/**
 * Read JPEG EXIF orientation (1–8). Returns 1 when missing/unsupported.
 * Used because Safari/iOS canvas paths often ignore EXIF.
 */
export function readJpegExifOrientation(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker === 0xffda || marker === 0xffd9) break;
    if ((marker & 0xff00) !== 0xff00) break;
    const size = view.getUint16(offset, false);
    if (size < 2 || offset + size > view.byteLength) break;

    if (marker === 0xffe1) {
      const start = offset + 2;
      if (
        start + 6 <= view.byteLength &&
        view.getUint32(start, false) === 0x45786966 && // "Exif"
        view.getUint16(start + 4, false) === 0
      ) {
        return readOrientationFromTiff(view, start + 6);
      }
    }
    offset += size;
  }
  return 1;
}

function readOrientationFromTiff(view: DataView, tiffStart: number): number {
  if (tiffStart + 8 > view.byteLength) return 1;
  const little = view.getUint16(tiffStart, false) === 0x4949;
  if (!little && view.getUint16(tiffStart, false) !== 0x4d4d) return 1;
  if (view.getUint16(tiffStart + 2, little) !== 0x002a) return 1;

  const ifdOffset = view.getUint32(tiffStart + 4, little);
  const ifdStart = tiffStart + ifdOffset;
  if (ifdStart + 2 > view.byteLength) return 1;

  const entries = view.getUint16(ifdStart, little);
  for (let i = 0; i < entries; i += 1) {
    const entry = ifdStart + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = view.getUint16(entry, little);
    if (tag === 0x0112) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

export type OrientedSize = { width: number; height: number };

/** Output size after applying EXIF orientation. */
export function sizeAfterOrientation(
  width: number,
  height: number,
  orientation: number,
): OrientedSize {
  if (orientation >= 5 && orientation <= 8) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * Draw raw image pixels into a canvas with EXIF orientation baked in.
 * Canvas must already be sized with sizeAfterOrientation().
 */
export function drawImageWithExifOrientation(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  orientation: number,
  srcWidth: number,
  srcHeight: number,
): void {
  // Matrix transforms from the widely-used EXIF canvas recipe.
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, srcWidth, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, srcWidth, srcHeight);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, srcHeight);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, srcHeight, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, srcHeight, srcWidth);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, srcWidth);
      break;
    default:
      break;
  }
  ctx.drawImage(img, 0, 0);
}
