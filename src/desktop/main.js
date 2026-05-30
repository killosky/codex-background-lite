import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyBackground, clearBackground, status } from "../cdp.js";
import { configFilePath, loadConfig, saveUploadedImage, updateConfig } from "../config.js";
import { restartCodexWithCdp } from "../launcher.js";
import { loadState, stateFilePath } from "../state.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function desktopFile(name) {
  return join(__dirname, name);
}

function normalizeError(error) {
  return {
    message: error?.message || String(error),
    stack: error?.stack || null
  };
}

async function payload() {
  const [config, state] = await Promise.all([loadConfig(), loadState()]);
  let previewImageDataUri = null;
  if (config.image?.path && config.image?.mime) {
    try {
      const bytes = await readFile(config.image.path);
      previewImageDataUri = `data:${config.image.mime};base64,${bytes.toString("base64")}`;
    } catch {
      previewImageDataUri = null;
    }
  }
  return {
    config,
    previewImageDataUri,
    state: {
      lastImage: state.lastImage
    },
    paths: {
      config: configFilePath(),
      state: stateFilePath()
    }
  };
}

async function saveSettings(input = {}) {
  let image = null;
  if (input.imageDataUri) {
    image = await saveUploadedImage(input.imageDataUri, input.imageName, {
      forceLarge: input.forceLarge === true
    });
  }

  await updateConfig({
    cdpPort: input.cdpPort,
    theme: input.theme,
    ...(image ? { image } : {})
  });

  return payload();
}

async function saveThenLoad(input = {}) {
  if (input && Object.keys(input).length > 0) {
    return saveSettings(input);
  }
  return payload();
}

async function applySavedBackground() {
  const config = await loadConfig();
  if (!config.image?.path) {
    throw new Error("请先选择图片并保存设置。");
  }

  return applyBackground({
    imagePath: config.image.path,
    port: config.cdpPort,
    forceLarge: true,
    themeOptions: config.theme
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 860,
    minHeight: 620,
    title: "Codex Background Lite",
    backgroundColor: "#111316",
    autoHideMenuBar: true,
    webPreferences: {
      preload: desktopFile("preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.loadFile(desktopFile("renderer.html"));
  return window;
}

ipcMain.handle("app:get-state", async () => payload());

ipcMain.handle("app:save-settings", async (_event, input) => saveSettings(input));

ipcMain.handle("app:choose-image", async () => {
  const result = await dialog.showOpenDialog({
    title: "选择背景图片",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }
    ]
  });
  if (result.canceled || !result.filePaths[0]) return null;

  const imagePath = result.filePaths[0];
  const bytes = await readFile(imagePath);
  const ext = imagePath.toLowerCase().split(".").pop();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return {
    name: basename(imagePath),
    dataUri: `data:${mime};base64,${bytes.toString("base64")}`
  };
});

ipcMain.handle("app:status", async (_event, input = {}) => {
  await saveThenLoad(input.settings);
  const config = await loadConfig();
  return status(config.cdpPort);
});

ipcMain.handle("app:apply-background", async (_event, input = {}) => {
  await saveThenLoad(input.settings);
  return applySavedBackground();
});

ipcMain.handle("app:clear-background", async (_event, input = {}) => {
  await saveThenLoad(input.settings);
  const config = await loadConfig();
  return clearBackground({ port: config.cdpPort });
});

ipcMain.handle("app:restart-codex", async (_event, input = {}) => {
  await saveThenLoad(input.settings);
  const config = await loadConfig();
  return restartCodexWithCdp({ port: config.cdpPort });
});

ipcMain.handle("app:open-path", async (_event, path) => {
  if (!path) return false;
  await shell.showItemInFolder(path);
  return true;
});

ipcMain.handle("app:open-external", async (_event, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("app:run-safe", async (_event, name, args) => {
  try {
    switch (name) {
      case "get-state":
        return { ok: true, data: await payload() };
      case "save-settings":
        return { ok: true, data: await saveSettings(args) };
      case "apply-background":
        await saveThenLoad(args?.settings);
        return { ok: true, data: await applySavedBackground() };
      default:
        throw new Error(`未知安全操作：${name}`);
    }
  } catch (error) {
    return { ok: false, error: normalizeError(error) };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
