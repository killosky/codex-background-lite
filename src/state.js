import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const APP_DIR = join(homedir(), ".codex-background-lite");
const STATE_FILE = join(APP_DIR, "state.json");

export function appDirPath() {
  return APP_DIR;
}

export function stateFilePath() {
  return STATE_FILE;
}

export async function loadState() {
  try {
    const text = await readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(text);
    return {
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      lastImage: typeof parsed.lastImage === "string" ? parsed.lastImage : null
    };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { registrations: [], lastImage: null };
    }
    throw error;
  }
}

export async function saveState(state) {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function addRegistration(identifier, metadata = {}) {
  if (!identifier) return;
  const state = await loadState();
  state.registrations.push({
    identifier,
    createdAt: new Date().toISOString(),
    ...metadata
  });
  if (metadata.imagePath) state.lastImage = metadata.imagePath;
  await saveState(state);
}

export async function clearRegistrations() {
  const state = await loadState();
  const registrations = state.registrations;
  state.registrations = [];
  await saveState(state);
  return registrations;
}
