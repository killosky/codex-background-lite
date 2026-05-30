import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const DEFAULT_MAX_BYTES = 12 * 1024 * 1024;

export function guessMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  throw new Error(`Unsupported image extension "${ext}". Use .jpg, .jpeg, .png, or .webp.`);
}

export async function imageFileToDataUri(filePath, options = {}) {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const absolutePath = resolve(filePath);
  const bytes = await readFile(absolutePath);
  if (bytes.byteLength > maxBytes && options.forceLarge !== true) {
    const mb = (bytes.byteLength / 1024 / 1024).toFixed(1);
    const limit = (maxBytes / 1024 / 1024).toFixed(0);
    throw new Error(`Image is ${mb} MB, above the ${limit} MB default limit. Use --force-large if you accept a larger CDP payload.`);
  }
  const mime = guessMimeType(absolutePath);
  return {
    absolutePath,
    mime,
    byteLength: bytes.byteLength,
    dataUri: `data:${mime};base64,${bytes.toString("base64")}`
  };
}
