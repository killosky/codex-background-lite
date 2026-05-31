const api = window.codexBackground;

const dictionaries = {
  "zh-CN": {
    htmlLang: "zh-CN",
    appTitle: "Codex 背景控制器",
    appSummary: "选择图片，调整视觉参数，然后把背景应用到当前 Codex Desktop 窗口。",
    applyButton: "应用到 Codex",
    statusButton: "状态检查",
    clearButton: "清除背景",
    settingsTitle: "设置",
    languageLabel: "语言",
    openConfigButton: "打开配置位置",
    backgroundSettings: "背景设置",
    imageTitle: "图片",
    chooseImageTitle: "选择 PNG / JPEG / WebP",
    chooseImageHelp: "图片会复制到本机配置目录，重启后可继续使用。",
    cdpPortLabel: "CDP 端口",
    accentLabel: "强调色",
    overlayLabel: "背景遮罩",
    panelOpacityLabel: "面板透明度",
    blurLabel: "面板模糊",
    fitLabel: "适配方式",
    positionLabel: "图片位置",
    saveButton: "保存设置",
    restartButton: "启动/重启 Codex",
    previewAndLog: "预览和日志",
    modeTitle: "当前模式",
    modeDescription: "“应用到 Codex”会先检查连接；如果 Codex 未开启本地调试端口，应用会请求确认并重启 Codex。Codex 完全退出或电脑重启后，只需重新打开此应用再点一次“应用到 Codex”。",
    logTitle: "运行日志",
    copyButton: "复制",
    readingConfig: "正在读取配置...",
    unchecked: "未检测",
    statusCheckHint: "点击状态检查连接 CDP。",
    noImage: "未选择图片",
    unsaved: "未保存",
    ready: "就绪。",
    settingsSaved: "设置已保存。",
    selectImage: "选择图片",
    canceled: "已取消。",
    selectedNote: "点击保存设置或应用到 Codex 后写入配置。",
    checkingStatus: "状态检查",
    connected: "已连接",
    connectedDetail: (port) => `找到 Codex target，端口 ${port}。`,
    noPage: "未找到页面",
    noPageDetail: (port) => `端口 ${port} 可访问，但没有 Codex 页面 target。`,
    connectionFailed: "连接失败",
    applying: "应用到 Codex",
    applied: "已应用",
    appliedDetail: (pageId) => `背景已注入到 target ${pageId}。`,
    applyFailed: "应用失败",
    autoRestartConfirm: (port) => `Codex 当前没有开启本地调试端口 ${port}，需要关闭并重新启动 Codex Desktop 后才能应用背景。继续吗？`,
    autoRestartCanceled: "已取消自动重启，背景尚未应用。",
    autoRestarting: "正在重启 Codex",
    autoRestartDetail: (port) => `正在用本地调试端口 ${port} 重新启动 Codex。`,
    waitingForCodex: "等待 Codex 就绪",
    waitingForCodexDetail: (port) => `正在等待 Codex 打开端口 ${port}。`,
    codexStillUnavailable: (port, detail) => `Codex 已请求重启，但端口 ${port} 仍不可用。${detail}`,
    clearConfirm: "这会清除当前 Codex 窗口里的背景。继续吗？",
    clearing: "清除背景",
    cleared: "已清除",
    clearedDetail: "当前 Codex 背景清除命令已执行。",
    clearFailed: "清除失败",
    restartConfirm: "这会关闭并重新启动 Codex Desktop，当前对话可能中断。继续吗？",
    restarting: "启动/重启 Codex",
    waiting: "正在等待",
    waitingDetail: "Codex 已请求重启，请稍后点击状态检查或应用到 Codex。",
    restartFailed: "重启失败",
    initFailed: "初始化失败"
  },
  "en-US": {
    htmlLang: "en",
    appTitle: "Codex Background Controller",
    appSummary: "Choose an image, tune the visual settings, then apply the background to the current Codex Desktop window.",
    applyButton: "Apply to Codex",
    statusButton: "Check Status",
    clearButton: "Clear Background",
    settingsTitle: "Settings",
    languageLabel: "Language",
    openConfigButton: "Open Config Folder",
    backgroundSettings: "Background settings",
    imageTitle: "Image",
    chooseImageTitle: "Choose PNG / JPEG / WebP",
    chooseImageHelp: "The image is copied to the local config folder so it remains available after restart.",
    cdpPortLabel: "CDP Port",
    accentLabel: "Accent Color",
    overlayLabel: "Background Overlay",
    panelOpacityLabel: "Panel Opacity",
    blurLabel: "Panel Blur",
    fitLabel: "Image Fit",
    positionLabel: "Image Position",
    saveButton: "Save Settings",
    restartButton: "Start / Restart Codex",
    previewAndLog: "Preview and log",
    modeTitle: "Current Mode",
    modeDescription: "Apply to Codex checks the connection first. If Codex has not opened the local debugging port, the app will ask to restart Codex. After Codex fully exits or the computer restarts, reopen this app and click “Apply to Codex” again.",
    logTitle: "Run Log",
    copyButton: "Copy",
    readingConfig: "Reading config...",
    unchecked: "Not checked",
    statusCheckHint: "Click Check Status to connect to CDP.",
    noImage: "No image selected",
    unsaved: "unsaved",
    ready: "Ready.",
    settingsSaved: "Settings saved.",
    selectImage: "Choose image",
    canceled: "Canceled.",
    selectedNote: "Click Save Settings or Apply to Codex to write it into the config.",
    checkingStatus: "Checking status",
    connected: "Connected",
    connectedDetail: (port) => `Found Codex target on port ${port}.`,
    noPage: "No page target",
    noPageDetail: (port) => `Port ${port} is reachable, but no Codex page target was found.`,
    connectionFailed: "Connection failed",
    applying: "Applying to Codex",
    applied: "Applied",
    appliedDetail: (pageId) => `Background injected into target ${pageId}.`,
    applyFailed: "Apply failed",
    autoRestartConfirm: (port) => `Codex has not opened local debugging port ${port}. Codex Desktop must be closed and restarted before the background can be applied. Continue?`,
    autoRestartCanceled: "Automatic restart was canceled; the background was not applied.",
    autoRestarting: "Restarting Codex",
    autoRestartDetail: (port) => `Restarting Codex with local debugging port ${port}.`,
    waitingForCodex: "Waiting for Codex",
    waitingForCodexDetail: (port) => `Waiting for Codex to open port ${port}.`,
    codexStillUnavailable: (port, detail) => `Codex restart was requested, but port ${port} is still unavailable. ${detail}`,
    clearConfirm: "This will clear the background in the current Codex window. Continue?",
    clearing: "Clearing background",
    cleared: "Cleared",
    clearedDetail: "The clear command has been sent to the current Codex window.",
    clearFailed: "Clear failed",
    restartConfirm: "This will close and restart Codex Desktop. The current conversation may be interrupted. Continue?",
    restarting: "Starting / restarting Codex",
    waiting: "Waiting",
    waitingDetail: "Codex restart has been requested. Check status or apply again after it opens.",
    restartFailed: "Restart failed",
    initFailed: "Initialization failed"
  }
};

const els = {
  connectionBox: document.getElementById("connectionBox"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  statusDetail: document.getElementById("statusDetail"),
  applyBtn: document.getElementById("applyBtn"),
  statusBtn: document.getElementById("statusBtn"),
  clearBtn: document.getElementById("clearBtn"),
  restartBtn: document.getElementById("restartBtn"),
  saveBtn: document.getElementById("saveBtn"),
  chooseImageBtn: document.getElementById("chooseImageBtn"),
  openConfigBtn: document.getElementById("openConfigBtn"),
  copyLogBtn: document.getElementById("copyLogBtn"),
  language: document.getElementById("language"),
  configPath: document.getElementById("configPath"),
  imageMeta: document.getElementById("imageMeta"),
  preview: document.getElementById("preview"),
  cdpPort: document.getElementById("cdpPort"),
  accent: document.getElementById("accent"),
  overlay: document.getElementById("overlay"),
  overlayValue: document.getElementById("overlayValue"),
  panelOpacity: document.getElementById("panelOpacity"),
  panelOpacityValue: document.getElementById("panelOpacityValue"),
  blur: document.getElementById("blur"),
  blurValue: document.getElementById("blurValue"),
  fit: document.getElementById("fit"),
  position: document.getElementById("position"),
  log: document.getElementById("log")
};

let current = null;
let pendingImage = null;
let busy = false;
let language = initialLanguage();
let connectionState = {
  kind: null,
  titleKey: "unchecked",
  detailKey: "statusCheckHint"
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initialLanguage() {
  const saved = localStorage.getItem("codex-background-lite-language");
  if (saved && dictionaries[saved]) return saved;
  return navigator.language && navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

function t(key, ...args) {
  const value = dictionaries[language][key] ?? dictionaries["zh-CN"][key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function setLanguage(nextLanguage) {
  if (!dictionaries[nextLanguage]) return;
  language = nextLanguage;
  localStorage.setItem("codex-background-lite-language", language);
  document.documentElement.lang = t("htmlLang");
  els.language.value = language;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    for (const pair of node.dataset.i18nAttr.split(";")) {
      const [attribute, key] = pair.split(":");
      if (attribute && key) node.setAttribute(attribute, t(key));
    }
  });

  if (!current) els.configPath.textContent = t("readingConfig");
  refreshImageMeta();
  if (connectionState.rawDetail) {
    setConnectionError(connectionState.kind, connectionState.titleKey, connectionState.rawDetail);
  } else {
    setConnection(connectionState.kind, connectionState.titleKey, connectionState.detailKey, ...(connectionState.detailArgs || []));
  }
  if (!els.log.textContent || [dictionaries["zh-CN"].ready, dictionaries["en-US"].ready].includes(els.log.textContent)) {
    writeLog(t("ready"));
  }
}

function setBusy(value) {
  busy = value;
  [
    els.applyBtn,
    els.statusBtn,
    els.clearBtn,
    els.restartBtn,
    els.saveBtn,
    els.chooseImageBtn
  ].forEach((button) => {
    button.disabled = value;
  });
}

function writeLog(value) {
  els.log.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function setConnection(kind, titleKey, detailKey, ...detailArgs) {
  connectionState = { kind, titleKey, detailKey, detailArgs };
  els.connectionBox.classList.remove("ok", "bad");
  if (kind) els.connectionBox.classList.add(kind);
  els.statusText.textContent = t(titleKey);
  els.statusDetail.textContent = t(detailKey, ...detailArgs);
}

function setConnectionError(kind, titleKey, detail) {
  connectionState = { kind, titleKey, detailKey: null, detailArgs: [], rawDetail: detail };
  els.connectionBox.classList.remove("ok", "bad");
  if (kind) els.connectionBox.classList.add(kind);
  els.statusText.textContent = t(titleKey);
  els.statusDetail.textContent = detail;
}

function themeFromInputs() {
  return {
    overlayOpacity: Number(els.overlay.value),
    panelOpacity: Number(els.panelOpacity.value),
    blur: Number(els.blur.value),
    fit: els.fit.value,
    position: els.position.value,
    accent: els.accent.value
  };
}

function settingsFromInputs() {
  const settings = {
    cdpPort: Number(els.cdpPort.value),
    theme: themeFromInputs(),
    language
  };
  if (pendingImage) {
    settings.imageDataUri = pendingImage.dataUri;
    settings.imageName = pendingImage.name;
    settings.forceLarge = true;
  }
  return settings;
}

function colorWithAlpha(hex, alpha) {
  const value = String(hex || "#a3e635").replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function paintPreview() {
  const theme = themeFromInputs();
  const imageUrl = pendingImage?.dataUri || current?.previewImageDataUri || "";

  if (pendingImage?.dataUri) {
    els.preview.style.backgroundImage = `linear-gradient(rgba(0,0,0,${theme.overlayOpacity}), rgba(0,0,0,${theme.overlayOpacity})), url("${pendingImage.dataUri}")`;
  } else if (current?.previewImageDataUri) {
    els.preview.style.backgroundImage = `linear-gradient(rgba(0,0,0,${theme.overlayOpacity}), rgba(0,0,0,${theme.overlayOpacity})), url("${current.previewImageDataUri}")`;
  } else {
    els.preview.style.backgroundImage = `linear-gradient(rgba(0,0,0,${theme.overlayOpacity}), rgba(0,0,0,${theme.overlayOpacity}))`;
  }

  if (!imageUrl) {
    els.preview.style.backgroundColor = "#20231d";
  }

  els.preview.style.backgroundSize = `cover, ${theme.fit}`;
  els.preview.style.backgroundPosition = `center, ${theme.position || "center top"}`;
  document.querySelectorAll(".mock-side,.mock-main,.mock-composer").forEach((node) => {
    node.style.background = `rgba(31, 33, 29, ${theme.panelOpacity})`;
    node.style.backdropFilter = `blur(${theme.blur}px) saturate(120%)`;
    node.style.webkitBackdropFilter = `blur(${theme.blur}px) saturate(120%)`;
    node.style.borderColor = colorWithAlpha(theme.accent, 0.38);
  });
}

function setTheme(theme) {
  els.overlay.value = els.overlayValue.value = theme.overlayOpacity;
  els.panelOpacity.value = els.panelOpacityValue.value = theme.panelOpacity;
  els.blur.value = els.blurValue.value = theme.blur;
  els.fit.value = theme.fit;
  els.position.value = theme.position;
  els.accent.value = theme.accent;
  paintPreview();
}

function refreshImageMeta() {
  if (pendingImage) {
    els.imageMeta.textContent = `${pendingImage.name} (${t("unsaved")})`;
    return;
  }
  els.imageMeta.textContent = current?.config?.image?.name || t("noImage");
}

function applyState(data) {
  current = data;
  pendingImage = null;
  els.configPath.textContent = data.paths.config;
  els.cdpPort.value = data.config.cdpPort;
  setTheme(data.config.theme);
  refreshImageMeta();
}

async function run(labelKey, callback) {
  if (busy) return;
  setBusy(true);
  writeLog(`${t(labelKey)}...`);
  try {
    const result = await callback();
    writeLog(result);
    return result;
  } catch (error) {
    writeLog(error.message || String(error));
    throw error;
  } finally {
    setBusy(false);
  }
}

async function load() {
  const data = await api.getState();
  applyState(data);
  writeLog(t("ready"));
}

async function save() {
  const data = await api.saveSettings(settingsFromInputs());
  applyState(data);
  writeLog(t("settingsSaved"));
  return data;
}

async function refreshState() {
  const data = await api.getState();
  applyState(data);
  return data;
}

async function checkCodexStatus() {
  const result = await api.status(settingsFromInputs());
  if (result.mainPage) {
    setConnection("ok", "connected", "connectedDetail", result.port);
  } else {
    setConnection("bad", "noPage", "noPageDetail", result.port);
  }
  await refreshState();
  return result;
}

async function waitForCodexReady(timeoutMs = 45000) {
  const started = Date.now();
  let lastDetail = "";

  while (Date.now() - started < timeoutMs) {
    try {
      const result = await api.status(settingsFromInputs());
      if (result.mainPage) {
        setConnection("ok", "connected", "connectedDetail", result.port);
        await refreshState();
        return result;
      }
      lastDetail = t("noPageDetail", result.port);
    } catch (error) {
      lastDetail = error.message || String(error);
    }
    await sleep(1500);
  }

  throw new Error(t("codexStillUnavailable", Number(els.cdpPort.value), lastDetail));
}

async function restartCodexAndWait() {
  const port = Number(els.cdpPort.value);
  if (!confirm(t("autoRestartConfirm", port))) {
    throw new Error(t("autoRestartCanceled"));
  }

  setConnection(null, "autoRestarting", "autoRestartDetail", port);
  writeLog(`${t("autoRestarting")}...`);
  await api.restartCodex(settingsFromInputs());

  setConnection(null, "waitingForCodex", "waitingForCodexDetail", port);
  writeLog(`${t("waitingForCodex")}...`);
  return waitForCodexReady();
}

async function ensureCodexReady() {
  try {
    const result = await checkCodexStatus();
    if (result.mainPage) return result;
  } catch (error) {
    setConnectionError("bad", "connectionFailed", error.message || String(error));
  }

  return restartCodexAndWait();
}

async function applyWithWorkflow() {
  await save();
  await ensureCodexReady();
  const result = await api.applyBackground(settingsFromInputs());
  await refreshState();
  setConnection("ok", "applied", "appliedDetail", result.pageId);
  return result;
}

function bindRange(range, number) {
  range.addEventListener("input", () => {
    number.value = range.value;
    paintPreview();
  });
  number.addEventListener("input", () => {
    range.value = number.value;
    paintPreview();
  });
}

setLanguage(language);
bindRange(els.overlay, els.overlayValue);
bindRange(els.panelOpacity, els.panelOpacityValue);
bindRange(els.blur, els.blurValue);
[els.fit, els.position, els.accent].forEach((node) => {
  node.addEventListener("input", paintPreview);
});

els.language.addEventListener("change", () => {
  setLanguage(els.language.value);
});

els.chooseImageBtn.addEventListener("click", async () => {
  await run("selectImage", async () => {
    const image = await api.chooseImage(language);
    if (!image) return t("canceled");
    pendingImage = image;
    refreshImageMeta();
    paintPreview();
    return { selected: image.name, note: t("selectedNote") };
  });
});

els.saveBtn.addEventListener("click", () => {
  run("saveButton", save).catch(() => {});
});

els.statusBtn.addEventListener("click", () => {
  run("checkingStatus", async () => {
    return checkCodexStatus();
  }).catch((error) => {
    setConnectionError("bad", "connectionFailed", error.message || String(error));
  });
});

els.applyBtn.addEventListener("click", () => {
  run("applying", async () => {
    return applyWithWorkflow();
  }).catch((error) => {
    setConnectionError("bad", "applyFailed", error.message || String(error));
  });
});

els.clearBtn.addEventListener("click", () => {
  if (!confirm(t("clearConfirm"))) return;
  run("clearing", async () => {
    const result = await api.clearBackground(settingsFromInputs());
    current = await api.getState();
    setConnection(null, "cleared", "clearedDetail");
    return result;
  }).catch((error) => {
    setConnectionError("bad", "clearFailed", error.message || String(error));
  });
});

els.restartBtn.addEventListener("click", () => {
  if (!confirm(t("restartConfirm"))) return;
  run("restarting", async () => {
    const result = await api.restartCodex(settingsFromInputs());
    setConnection(null, "waiting", "waitingDetail");
    return result;
  }).catch((error) => {
    setConnectionError("bad", "restartFailed", error.message || String(error));
  });
});

els.openConfigBtn.addEventListener("click", () => {
  const path = current?.paths?.config;
  if (path) api.openPath(path).catch((error) => writeLog(error.message || String(error)));
});

els.copyLogBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.log.textContent || "");
});

load().catch((error) => {
  setConnectionError("bad", "initFailed", error.message || String(error));
  writeLog(error.message || String(error));
});
