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

export async function readJsonBlob<T>(
  pathname: string,
  fallback: T
): Promise<T> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await get(pathname, {
        access: "private",
        useCache: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return fallback;
      }
      const text = await streamToString(result.stream);
      if (!text.trim()) return fallback;
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`readJsonBlob ${pathname}`, err);
      return fallback;
    }
  }
  if (process.env.VERCEL) return fallback;
  return readLocalJson(pathname, fallback);
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
