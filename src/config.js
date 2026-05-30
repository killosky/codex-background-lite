import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { normalizeThemeOptions } from "./theme-script.js";
import { appDirPath } from "./state.js";

const CONFIG_FILE = join(appDirPath(), "config.json");
const IMAGE_DIR = join(appDirPath(), "images");
const DEFAULT_MAX_BYTES = 12 * 1024 * 1024;

const DEFAULT_CONFIG = {
  cdpPort: 9222,
  theme: normalizeThemeOptions(),
  image: null
};

function cleanPort(value) {
  const port = Number(value ?? DEFAULT_CONFIG.cdpPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return DEFAULT_CONFIG.cdpPort;
  return port;
}

function cleanImageRecord(image) {
  if (!image || typeof image !== "object") return null;
  if (typeof image.path !== "string" || typeof image.mime !== "string") return null;
  return {
    path: image.path,
    name: typeof image.name === "string" ? image.name : basename(image.path),
    mime: image.mime,
    bytes: Number.isFinite(Number(image.bytes)) ? Number(image.bytes) : null,
    savedAt: typeof image.savedAt === "string" ? image.savedAt : null
  };
}

export function configFilePath() {
  return CONFIG_FILE;
}

export async function loadConfig() {
  try {
    const text = await readFile(CONFIG_FILE, "utf8");
    const parsed = JSON.parse(text);
    return {
      cdpPort: cleanPort(parsed.cdpPort),
      theme: normalizeThemeOptions(parsed.theme),
      image: cleanImageRecord(parsed.image)
    };
  } catch (error) {
    if (error && error.code === "ENOENT") return { ...DEFAULT_CONFIG };
    throw error;
  }
}

export async function saveConfig(config) {
  const cleaned = {
    cdpPort: cleanPort(config.cdpPort),
    theme: normalizeThemeOptions(config.theme),
    image: cleanImageRecord(config.image)
  };
  await mkdir(dirname(CONFIG_FILE), { recursive: true });
  await writeFile(CONFIG_FILE, `${JSON.stringify(cleaned, null, 2)}\n`, "utf8");
  return cleaned;
}

export async function updateConfig(patch = {}) {
  const current = await loadConfig();
  return saveConfig({
    ...current,
    ...patch,
    theme: patch.theme ? normalizeThemeOptions({ ...current.theme, ...patch.theme }) : current.theme,
    image: patch.image === undefined ? current.image : patch.image
  });
}

export async function saveUploadedImage(dataUri, originalName = "background", options = {}) {
  const match = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(dataUri || ""));
  if (!match) {
    throw new Error("Image upload must be a PNG, JPEG, or WebP data URI.");
  }

  const mime = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  if (bytes.byteLength > maxBytes && options.forceLarge !== true) {
    const mb = (bytes.byteLength / 1024 / 1024).toFixed(1);
    const limit = (maxBytes / 1024 / 1024).toFixed(0);
    throw new Error(`Image is ${mb} MB, above the ${limit} MB default limit.`);
  }

  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const safeBase = basename(String(originalName || "background"))
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 48) || "background";
  const imagePath = join(IMAGE_DIR, `${Date.now()}-${digest}-${safeBase}.${extension}`);

  await mkdir(IMAGE_DIR, { recursive: true });
  await writeFile(imagePath, bytes);

  return {
    path: imagePath,
    name: basename(String(originalName || imagePath)),
    mime,
    bytes: bytes.byteLength,
    savedAt: new Date().toISOString()
  };
}
