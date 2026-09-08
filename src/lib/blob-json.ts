import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

async function streamToString(
  stream: ReadableStream<Uint8Array>
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

function localPath(pathname: string) {
  return path.join(process.cwd(), "data", ".blob", pathname);
}

export function isBlobNotFound(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    name?: string;
    message?: string;
    statusCode?: number;
    status?: number;
    code?: string;
  };
  if (e.name === "BlobNotFoundError") return true;
  if (e.statusCode === 404 || e.status === 404) return true;
  if (e.code === "ENOENT") return true;
  const msg = String(e.message ?? "");
  if (/500|502|503|504/.test(msg)) return false;
  return /not found|404/i.test(msg);
}

function isRetryableBlobError(err: unknown): boolean {
  if (isBlobNotFound(err)) return false;
  const e = err as { statusCode?: number; status?: number; message?: string };
  const status = e.statusCode ?? e.status;
  if (status && status >= 500) return true;
  const msg = String(e.message ?? "");
  return /500|502|503|504|fetch blob|ECONNRESET|ETIMEDOUT/i.test(msg);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getBlobWithRetry(pathname: string) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await get(pathname, {
        access: "private",
        useCache: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (err) {
      lastErr = err;
      if (isBlobNotFound(err)) throw err;
      if (!isRetryableBlobError(err) || attempt === 2) throw err;
      await sleep(150 * (attempt + 1));
    }
  }
  throw lastErr;
}

async function readLocalJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(localPath(pathname), "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeLocalJson<T>(pathname: string, data: T): Promise<void> {
  const file = localPath(pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Read JSON from Vercel Blob.
 * Missing blob → fallback. Transient/5xx errors throw so callers never
 * persist an empty fallback over live data.
 */
export async function readJsonBlob<T>(
  pathname: string,
  fallback: T
): Promise<T> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await getBlobWithRetry(pathname);
      if (!result || result.statusCode !== 200 || !result.stream) {
        return fallback;
      }
      const text = await streamToString(result.stream);
      if (!text.trim()) return fallback;
      return JSON.parse(text) as T;
    } catch (err) {
      if (isBlobNotFound(err)) return fallback;
      console.error(`readJsonBlob ${pathname}`, err);
      throw err;
    }
  }
  if (process.env.VERCEL) return fallback;
  return readLocalJson(pathname, fallback);
}

/** Like readJsonBlob, but returns undefined when the blob does not exist. */
export async function readJsonBlobIfPresent<T>(
  pathname: string,
): Promise<T | undefined> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await getBlobWithRetry(pathname);
      if (!result || result.statusCode !== 200 || !result.stream) {
        return undefined;
      }
      const text = await streamToString(result.stream);
      if (!text.trim()) return undefined;
      return JSON.parse(text) as T;
    } catch (err) {
      if (isBlobNotFound(err)) return undefined;
      console.error(`readJsonBlob ${pathname}`, err);
      throw err;
    }
  }
  if (process.env.VERCEL) return undefined;
  try {
    const raw = await fs.readFile(localPath(pathname), "utf8");
    if (!raw.trim()) return undefined;
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeJsonBlob<T>(pathname: string, data: T): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(pathname, JSON.stringify(data, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  await writeLocalJson(pathname, data);
}
