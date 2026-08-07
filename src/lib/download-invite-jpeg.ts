import { toJpeg } from "html-to-image";

/** Prefer subdomain slug; fall back to a safe event-name slug. */
export function inviteDownloadFileBase(slug?: string | null, title?: string | null): string {
  const fromSlug = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (fromSlug) return fromSlug;
  const fromTitle = String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  return fromTitle || "invite";
}

/**
 * Capture an invite card DOM node as a compact, sharp JPEG and download it.
 * Uses 2× pixel ratio for crispness, then JPEG compression for a small file.
 */
export async function downloadInviteCardJpeg(
  node: HTMLElement,
  fileBase: string,
): Promise<void> {
  // Let fonts/images settle one frame before capture.
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => resolve()),
  );

  const dataUrl = await toJpeg(node, {
    quality: 0.84,
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
    // Keep capture bounded so the file stays small.
    filter: (el) => {
      if (!(el instanceof HTMLElement)) return true;
      if (el.classList.contains("invite-print-toolbar")) return false;
      if (el.classList.contains("print-hidden")) return false;
      return true;
    },
  });

  // Re-encode at a max long-edge to shrink bytes without looking soft.
  const compressed = await recompressJpeg(dataUrl, {
    maxEdge: 1600,
    quality: 0.84,
  });

  const link = document.createElement("a");
  link.download = `${fileBase}.jpg`;
  link.href = compressed;
  link.click();
}

async function recompressJpeg(
  dataUrl: string,
  opts: { maxEdge: number; quality: number },
): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, opts.maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", opts.quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load invite image"));
    img.src = src;
  });
}
