import { domToPng } from "modern-screenshot";

/** Prefer subdomain slug; fall back to a safe event-name slug. */
export function inviteDownloadFileBase(
  slug?: string | null,
  title?: string | null,
): string {
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

function isSafariLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iP(ad|hone|od)/i.test(ua);
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|FxiOS/i.test(ua);
  return isIOS || isSafari;
}

function toErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  // Screenshot libs / image onerror often reject with an Event, not an Error.
  if (err && typeof err === "object" && "type" in err) {
    return fallback;
  }
  return fallback;
}

async function waitForPaint(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

async function waitForFonts(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts;
    if (fonts?.ready) await Promise.race([fonts.ready, delay(1500)]);
  } catch {
    // ignore
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a remote/same-origin image and return a compact JPEG data URL.
 * Keeps the SVG foreignObject payload small enough for mobile Safari.
 * Embedded photos stay JPEG; the final postcard export is PNG.
 */
async function imageUrlToCompactDataUrl(
  src: string,
  maxEdge = 1100,
  quality = 0.82,
): Promise<string | null> {
  if (!src || src.startsWith("data:")) {
    if (src.startsWith("data:image/")) {
      return shrinkDataUrl(src, maxEdge, quality);
    }
    return src || null;
  }

  try {
    const res = await fetch(src, { cache: "force-cache", mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const raw = await blobToDataUrl(blob);
    return shrinkDataUrl(raw, maxEdge, quality);
  } catch {
    // Fallback: draw via Image + canvas (works when img already loaded with CORS).
    try {
      const img = await loadImage(src, true);
      return canvasEncodeJpeg(img, maxEdge, quality);
    } catch {
      return null;
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

async function shrinkDataUrl(
  dataUrl: string,
  maxEdge: number,
  quality: number,
): Promise<string> {
  const img = await loadImage(dataUrl, false);
  return canvasEncodeJpeg(img, maxEdge, quality);
}

function canvasEncodeJpeg(
  img: HTMLImageElement,
  maxEdge: number,
  quality: number,
): string {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height, 1));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function canvasEncodePng(img: HTMLImageElement, maxEdge: number): string {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height, 1));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

function loadImage(
  src: string,
  crossOrigin: boolean,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load invite image"));
    img.src = src;
  });
}

/**
 * Replace <img> sources inside the capture target with compact data URLs
 * so the SVG foreignObject payload stays under mobile Safari limits.
 * Restores originals after capture.
 */
async function withInlinedImages<T>(
  node: HTMLElement,
  run: () => Promise<T>,
): Promise<T> {
  const images = Array.from(node.querySelectorAll("img"));
  const restores: Array<() => void> = [];

  await Promise.all(
    images.map(async (img) => {
      const originalSrc = img.getAttribute("src");
      const originalSrcset = img.getAttribute("srcset");
      const current = img.currentSrc || img.src;
      if (!current) return;

      const dataUrl = await imageUrlToCompactDataUrl(current);
      if (!dataUrl) return;

      restores.push(() => {
        if (originalSrc == null) img.removeAttribute("src");
        else img.setAttribute("src", originalSrc);
        if (originalSrcset == null) img.removeAttribute("srcset");
        else img.setAttribute("srcset", originalSrcset);
      });

      img.removeAttribute("srcset");
      img.setAttribute("src", dataUrl);
      try {
        // Ensure decode completes before capture.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (img as any).decode === "function") await img.decode();
      } catch {
        // ignore decode failures; onload path already succeeded
      }
    }),
  );

  try {
    return await run();
  } finally {
    for (const restore of restores) restore();
  }
}

async function triggerDownload(dataUrl: string, fileName: string): Promise<void> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], fileName, { type: blob.type || "image/png" });

  // Mobile browsers often block <a download> after async work (lost user gesture).
  // Web Share with a file is the reliable path on iOS/Android — ideal for Texts.
  const canShareFile =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare({ files: [file] }));

  if (canShareFile) {
    try {
      await navigator.share({
        files: [file],
        title: fileName,
      });
      return;
    } catch (err) {
      // User cancel should not surface as a capture failure.
      if (
        err instanceof DOMException &&
        (err.name === "AbortError" || err.name === "NotAllowedError")
      ) {
        return;
      }
      // Fall through to anchor download.
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = objectUrl;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  // iOS Safari ignores download= and may leave the user with nothing after async.
  // Open the image as a last resort so they can long-press / save.
  const needsOpenFallback =
    isSafariLike() &&
    /iP(ad|hone|od)/i.test(navigator.userAgent);
  if (needsOpenFallback) {
    setTimeout(() => {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    }, 250);
    // Keep object URL alive longer when opened in a tab.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  setTimeout(() => URL.revokeObjectURL(objectUrl), 4_000);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data = ""] = dataUrl.split(",", 2);
  const mime = /data:([^;]+)/.exec(header)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Capture an invite card DOM node as a sharp PNG and download/share it.
 * Uses 2× scale for crisp type; PNG keeps text cleaner than JPEG for Texts.
 */
export async function downloadInviteCardPng(
  node: HTMLElement,
  fileBase: string,
): Promise<void> {
  await waitForFonts();
  await waitForPaint();

  const fileName = `${fileBase}.png`;

  try {
    const dataUrl = await withInlinedImages(node, async () => {
      const options = {
        scale: 2,
        backgroundColor: "#ffffff",
        // Safari needs a beat after SVG→Image decode.
        drawImageInterval: isSafariLike() ? 200 : 100,
        features: {
          fixSvgXmlDecode: true,
          removeAbnormalAttributes: true,
          removeControlCharacter: true,
        },
        fetch: {
          // Images are already inlined as data URLs; keep a safe placeholder.
          placeholderImage:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        },
        filter: (el: Node) => {
          if (!(el instanceof HTMLElement)) return true;
          if (el.classList.contains("invite-print-toolbar")) return false;
          if (el.classList.contains("print-hidden")) return false;
          return true;
        },
      };

      // Safari often needs a warm-up capture before foreignObject images paint.
      if (isSafariLike()) {
        try {
          await domToPng(node, options);
        } catch {
          // warm-up failures are fine; second pass is what we keep
        }
        await delay(50);
      }

      return domToPng(node, options);
    });

    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      throw new Error("Could not create PNG");
    }

    const sized = await resizePng(dataUrl, { maxEdge: 1600 });

    await triggerDownload(sized, fileName);
  } catch (err) {
    throw new Error(toErrorMessage(err, "Could not create PNG"));
  }
}

/** @deprecated Use downloadInviteCardPng — kept for older imports. */
export async function downloadInviteCardJpeg(
  node: HTMLElement,
  fileBase: string,
): Promise<void> {
  return downloadInviteCardPng(node, fileBase);
}

async function resizePng(
  dataUrl: string,
  opts: { maxEdge: number },
): Promise<string> {
  const img = await loadImage(dataUrl, false);
  return canvasEncodePng(img, opts.maxEdge) || dataUrl;
}
