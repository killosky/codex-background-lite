const { contextBridge, ipcRenderer } = require("electron");

const api = {
  getState: () => ipcRenderer.invoke("app:get-state"),
  saveSettings: (settings) => ipcRenderer.invoke("app:save-settings", settings),
  chooseImage: () => ipcRenderer.invoke("app:choose-image"),
  status: (settings) => ipcRenderer.invoke("app:status", { settings }),
  applyBackground: (settings) => ipcRenderer.invoke("app:apply-background", { settings }),
  clearBackground: (settings) => ipcRenderer.invoke("app:clear-background", { settings }),
  restartCodex: (settings) => ipcRenderer.invoke("app:restart-codex", { settings }),
  openPath: (path) => ipcRenderer.invoke("app:open-path", path),
  openExternal: (url) => ipcRenderer.invoke("app:open-external", url)
};

contextBridge.exposeInMainWorld("codexBackground", api);
