import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
      lastImage: typeof parsed.lastImage === "string" ? parsed.lastImage : null
    };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { lastImage: null };
    }
    throw error;
  }
}
