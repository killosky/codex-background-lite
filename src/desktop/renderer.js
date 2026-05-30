const api = window.codexBackground;

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

function setConnection(kind, title, detail) {
  els.connectionBox.classList.remove("ok", "bad");
  if (kind) els.connectionBox.classList.add(kind);
  els.statusText.textContent = title;
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
    theme: themeFromInputs()
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
    els.imageMeta.textContent = `${pendingImage.name} (未保存)`;
    return;
  }
  els.imageMeta.textContent = current?.config?.image?.name || "未选择图片";
}

function applyState(data) {
  current = data;
  pendingImage = null;
  els.configPath.textContent = data.paths.config;
  els.cdpPort.value = data.config.cdpPort;
  setTheme(data.config.theme);
  refreshImageMeta();
}

async function run(label, callback) {
  if (busy) return;
  setBusy(true);
  writeLog(`${label}...`);
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
  writeLog("就绪。");
}

async function save() {
  const data = await api.saveSettings(settingsFromInputs());
  applyState(data);
  writeLog("设置已保存。");
  return data;
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

bindRange(els.overlay, els.overlayValue);
bindRange(els.panelOpacity, els.panelOpacityValue);
bindRange(els.blur, els.blurValue);
[els.fit, els.position, els.accent].forEach((node) => {
  node.addEventListener("input", paintPreview);
});

els.chooseImageBtn.addEventListener("click", async () => {
  await run("选择图片", async () => {
    const image = await api.chooseImage();
    if (!image) return "已取消。";
    pendingImage = image;
    refreshImageMeta();
    paintPreview();
    return { selected: image.name, note: "点击保存设置或应用到 Codex 后写入配置。" };
  });
});

els.saveBtn.addEventListener("click", () => {
  run("保存设置", save).catch(() => {});
});

els.statusBtn.addEventListener("click", () => {
  run("状态检查", async () => {
    const result = await api.status(settingsFromInputs());
    if (result.mainPage) {
      setConnection("ok", "已连接", `找到 Codex target，端口 ${result.port}。`);
    } else {
      setConnection("bad", "未找到页面", `端口 ${result.port} 可访问，但没有 Codex 页面 target。`);
    }
    current = await api.getState();
    pendingImage = null;
    refreshImageMeta();
    return result;
  }).catch((error) => {
    setConnection("bad", "连接失败", error.message || String(error));
  });
});

els.applyBtn.addEventListener("click", () => {
  run("应用到 Codex", async () => {
    const result = await api.applyBackground(settingsFromInputs());
    current = await api.getState();
    pendingImage = null;
    refreshImageMeta();
    setConnection("ok", "已应用", `背景已注入到 target ${result.pageId}。`);
    return result;
  }).catch((error) => {
    setConnection("bad", "应用失败", error.message || String(error));
  });
});

els.clearBtn.addEventListener("click", () => {
  if (!confirm("这会清除当前 Codex 窗口里的背景。继续吗？")) return;
  run("清除背景", async () => {
    const result = await api.clearBackground(settingsFromInputs());
    current = await api.getState();
    setConnection(null, "已清除", "当前 Codex 背景清除命令已执行。");
    return result;
  }).catch((error) => {
    setConnection("bad", "清除失败", error.message || String(error));
  });
});

els.restartBtn.addEventListener("click", () => {
  if (!confirm("这会关闭并重新启动 Codex Desktop，当前对话可能中断。继续吗？")) return;
  run("启动/重启 Codex", async () => {
    const result = await api.restartCodex(settingsFromInputs());
    setConnection(null, "正在等待", "Codex 已请求重启，请稍后点击状态检查或应用到 Codex。");
    return result;
  }).catch((error) => {
    setConnection("bad", "重启失败", error.message || String(error));
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
  setConnection("bad", "初始化失败", error.message || String(error));
  writeLog(error.message || String(error));
});
