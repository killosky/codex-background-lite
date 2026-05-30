export function renderUiPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>codex-background-lite</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #101114;
      --panel: #181a20;
      --panel-2: #20232b;
      --line: #383d49;
      --text: #f2f4f8;
      --muted: #9da6b8;
      --accent: #7dd3fc;
      --warn: #f6c177;
      --danger: #ff8a8a;
      --ok: #8bd7a8;
      font-family: "Aptos", "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
      color: var(--text);
    }
    button, input, select {
      font: inherit;
    }
    .shell {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 24px 0 32px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 16px;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      letter-spacing: 0;
      font-weight: 720;
    }
    .sub {
      color: var(--muted);
      font-size: 13px;
    }
    .pill {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.04);
      color: var(--muted);
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 12px;
      max-width: min(610px, 100%);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .header-tools {
      display: grid;
      justify-items: end;
      gap: 8px;
      min-width: 0;
      max-width: min(610px, 100%);
    }
    .lang-toggle {
      display: inline-flex;
      padding: 3px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,0.04);
    }
    .lang-btn {
      min-height: 28px;
      padding: 4px 9px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--muted);
      font-size: 12px;
    }
    .lang-btn.active {
      background: var(--accent);
      color: #081018;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    section {
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 94%, transparent);
      border-radius: 8px;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 14px 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .body {
      padding: 14px;
    }
    .drop {
      display: grid;
      gap: 10px;
      min-height: 168px;
      place-items: center;
      padding: 18px;
      border: 1px dashed #596171;
      border-radius: 8px;
      background: rgba(255,255,255,0.035);
      text-align: center;
      cursor: pointer;
    }
    .drop:hover {
      border-color: var(--accent);
      background: rgba(125, 211, 252, 0.07);
    }
    .drop strong {
      display: block;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .drop span {
      color: var(--muted);
      font-size: 12px;
    }
    .preview {
      min-height: 290px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--line);
      background-color: #111827;
      background-size: cover;
      background-position: center top;
      position: relative;
    }
    .mock {
      position: absolute;
      inset: 18px;
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 12px;
    }
    .side, .main, .composer {
      background: rgba(17,24,39,0.62);
      border: 1px solid rgba(255,255,255,0.14);
      backdrop-filter: blur(5px) saturate(120%);
      border-radius: 8px;
    }
    .side { min-height: 250px; }
    .main {
      min-height: 250px;
      position: relative;
    }
    .composer {
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 18px;
      height: 56px;
    }
    label {
      display: grid;
      gap: 7px;
      margin-bottom: 13px;
      color: var(--muted);
      font-size: 12px;
    }
    .range-line {
      display: grid;
      grid-template-columns: 1fr 58px;
      gap: 10px;
      align-items: center;
    }
    input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
    }
    input[type="number"], input[type="text"], select, input[type="color"] {
      width: 100%;
      min-height: 36px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 7px 9px;
      background: #111319;
      color: var(--text);
    }
    input[type="color"] {
      padding: 3px;
    }
    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    button {
      min-height: 36px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      padding: 7px 11px;
      cursor: pointer;
    }
    button:hover {
      border-color: var(--accent);
    }
    button.primary {
      background: var(--accent);
      color: #081018;
      border-color: var(--accent);
      font-weight: 700;
    }
    button.warn {
      border-color: color-mix(in srgb, var(--warn) 62%, var(--line));
    }
    button.danger {
      border-color: color-mix(in srgb, var(--danger) 62%, var(--line));
    }
    .log {
      min-height: 180px;
      max-height: 260px;
      overflow: auto;
      margin: 0;
      padding: 12px;
      border-radius: 8px;
      background: #0b0d12;
      border: 1px solid var(--line);
      color: #cad3df;
      font: 12px/1.5 "Cascadia Code", Consolas, monospace;
      white-space: pre-wrap;
    }
    .state {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: rgba(255,255,255,0.035);
    }
    .metric b {
      display: block;
      font-size: 18px;
      margin-bottom: 3px;
    }
    .metric span {
      color: var(--muted);
      font-size: 12px;
    }
    .notice {
      border-left: 3px solid var(--warn);
      padding: 9px 10px;
      background: rgba(246,193,119,0.08);
      color: #f7dfb8;
      font-size: 12px;
      line-height: 1.45;
      margin-bottom: 12px;
    }
    .hidden { display: none; }
    @media (max-width: 860px) {
      .grid, .mock, .split {
        grid-template-columns: 1fr;
      }
      header {
        align-items: start;
        flex-direction: column;
      }
      .header-tools {
        justify-items: stretch;
        width: 100%;
      }
      .state {
        grid-template-columns: 1fr;
      }
      .side {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>codex-background-lite</h1>
        <div class="sub" data-i18n="subtitle">本地背景控制台。除非你点击应用按钮，否则不会修改 Codex。</div>
      </div>
      <div class="header-tools">
        <div class="lang-toggle" aria-label="Language">
          <button class="lang-btn active" id="langZh" type="button">中文</button>
          <button class="lang-btn" id="langEn" type="button">English</button>
        </div>
        <div class="pill" id="configPath" data-i18n="loadingConfig">正在读取配置...</div>
      </div>
    </header>

    <div class="grid">
      <div>
        <section>
          <div class="section-head">
            <h2 data-i18n="imageTitle">图片</h2>
            <span class="sub" id="imageMeta" data-i18n="noImage">未选择图片</span>
          </div>
          <div class="body">
            <label class="drop" for="imageInput">
              <input id="imageInput" class="hidden" type="file" accept="image/png,image/jpeg,image/webp">
              <div>
                <strong data-i18n="chooseImage">选择 PNG、JPEG 或 WebP</strong>
                <span data-i18n="imageHint">图片会复制到 ~/.codex-background-lite/images。</span>
              </div>
            </label>
            <div class="notice" data-i18n="safetyNotice">状态检查会通过 CDP 访问 Codex。应用和清除会修改当前 Codex 界面。此页面不会重启 Codex。</div>
          </div>
        </section>

        <section style="margin-top:16px">
          <div class="section-head">
            <h2 data-i18n="themeTitle">主题</h2>
            <span class="sub" data-i18n="livePreview">本地实时预览</span>
          </div>
          <div class="body">
            <label><span data-i18n="overlayLabel">背景遮罩</span> <div class="range-line"><input id="overlay" type="range" min="0" max="0.9" step="0.01"><input id="overlayValue" type="number" min="0" max="0.9" step="0.01"></div></label>
            <label><span data-i18n="panelOpacityLabel">面板透明度</span> <div class="range-line"><input id="panelOpacity" type="range" min="0.05" max="0.95" step="0.01"><input id="panelOpacityValue" type="number" min="0.05" max="0.95" step="0.01"></div></label>
            <label><span data-i18n="blurLabel">模糊</span> <div class="range-line"><input id="blur" type="range" min="0" max="32" step="1"><input id="blurValue" type="number" min="0" max="32" step="1"></div></label>
            <div class="split">
              <label><span data-i18n="fitLabel">适配</span> <select id="fit"><option>cover</option><option>contain</option><option>auto</option></select></label>
              <label><span data-i18n="accentLabel">强调色</span> <input id="accent" type="color"></label>
            </div>
            <label><span data-i18n="positionLabel">位置</span> <input id="position" type="text" placeholder="center top"></label>
            <label><span data-i18n="cdpPortLabel">CDP 端口</span> <input id="cdpPort" type="number" min="1" max="65535" step="1"></label>
            <div class="actions">
              <button class="primary" id="saveBtn" data-i18n="saveSettings">保存设置</button>
              <button id="dryRunBtn" data-i18n="dryRun">仅生成脚本</button>
              <button id="statusBtn" data-i18n="status">状态检查</button>
            </div>
          </div>
        </section>
      </div>

      <div>
        <section>
          <div class="section-head">
            <h2 data-i18n="previewTitle">预览</h2>
            <span class="sub" data-i18n="previewHint">近似 Codex 界面效果</span>
          </div>
          <div class="body">
            <div class="preview" id="preview">
              <div class="mock">
                <div class="side"></div>
                <div class="main"><div class="composer"></div></div>
              </div>
            </div>
          </div>
        </section>

        <section style="margin-top:16px">
          <div class="section-head">
            <h2 data-i18n="actionsTitle">Codex 操作</h2>
            <span class="sub" data-i18n="manualConfirm">需要手动确认</span>
          </div>
          <div class="body">
            <div class="state">
              <div class="metric"><b id="regCount">0</b><span data-i18n="savedHooks">已保存 hook</span></div>
              <div class="metric"><b id="lastBytes">0</b><span data-i18n="imageBytes">图片字节</span></div>
              <div class="metric"><b id="portMetric">9222</b><span data-i18n="cdpPortMetric">CDP 端口</span></div>
            </div>
            <div class="actions">
              <button class="warn" id="applyPreviewBtn" data-i18n="applyPreview">应用预览</button>
              <button class="warn" id="applyPersistBtn" data-i18n="applyPersistent">持久应用</button>
              <button class="danger" id="clearBtn" data-i18n="clearCodex">清除 Codex 界面</button>
            </div>
            <div class="actions">
              <button id="reloadBtn" data-i18n="reloadConfig">重新读取配置</button>
            </div>
            <pre class="log" id="log">就绪。</pre>
          </div>
        </section>
      </div>
    </div>
  </div>

  <script>
    const els = {
      configPath: document.getElementById('configPath'),
      imageMeta: document.getElementById('imageMeta'),
      imageInput: document.getElementById('imageInput'),
      preview: document.getElementById('preview'),
      overlay: document.getElementById('overlay'),
      overlayValue: document.getElementById('overlayValue'),
      panelOpacity: document.getElementById('panelOpacity'),
      panelOpacityValue: document.getElementById('panelOpacityValue'),
      blur: document.getElementById('blur'),
      blurValue: document.getElementById('blurValue'),
      fit: document.getElementById('fit'),
      accent: document.getElementById('accent'),
      position: document.getElementById('position'),
      cdpPort: document.getElementById('cdpPort'),
      regCount: document.getElementById('regCount'),
      lastBytes: document.getElementById('lastBytes'),
      portMetric: document.getElementById('portMetric'),
      log: document.getElementById('log'),
      langZh: document.getElementById('langZh'),
      langEn: document.getElementById('langEn')
    };

    let current = null;
    let pendingImage = null;
    let lang = localStorage.getItem('codex-background-lite-lang') || 'zh';

    const i18n = {
      zh: {
        subtitle: '本地背景控制台。除非你点击应用按钮，否则不会修改 Codex。',
        loadingConfig: '正在读取配置...',
        imageTitle: '图片',
        noImage: '未选择图片',
        chooseImage: '选择 PNG、JPEG 或 WebP',
        imageHint: '图片会复制到 ~/.codex-background-lite/images。',
        safetyNotice: '状态检查会通过 CDP 访问 Codex。应用和清除会修改当前 Codex 界面。此页面不会重启 Codex。',
        themeTitle: '主题',
        livePreview: '本地实时预览',
        overlayLabel: '背景遮罩',
        panelOpacityLabel: '面板透明度',
        blurLabel: '模糊',
        fitLabel: '适配',
        accentLabel: '强调色',
        positionLabel: '位置',
        cdpPortLabel: 'CDP 端口',
        saveSettings: '保存设置',
        dryRun: '仅生成脚本',
        status: '状态检查',
        previewTitle: '预览',
        previewHint: '近似 Codex 界面效果',
        actionsTitle: 'Codex 操作',
        manualConfirm: '需要手动确认',
        savedHooks: '已保存 hook',
        imageBytes: '图片字节',
        cdpPortMetric: 'CDP 端口',
        applyPreview: '应用预览',
        applyPersistent: '持久应用',
        clearCodex: '清除 Codex 界面',
        reloadConfig: '重新读取配置',
        ready: '就绪。',
        configLoaded: '配置已读取。',
        settingsSaved: '设置已保存。',
        unsaved: '未保存',
        applyPreviewConfirm: '应用预览会修改当前 Codex 界面，但不会持久化。继续吗？',
        applyPersistentConfirm: '持久应用会修改当前 Codex 界面，并注册 reload hook。继续吗？',
        clearConfirm: '清除会修改当前 Codex 界面，并尽可能移除已保存的 reload hook。继续吗？'
      },
      en: {
        subtitle: 'Local background control. Nothing is applied until you press an Apply button.',
        loadingConfig: 'Loading config...',
        imageTitle: 'Image',
        noImage: 'No image',
        chooseImage: 'Choose PNG, JPEG, or WebP',
        imageHint: 'The file is copied into ~/.codex-background-lite/images.',
        safetyNotice: 'Status contacts Codex over CDP. Apply and Clear modify the current Codex UI. This page does not restart Codex.',
        themeTitle: 'Theme',
        livePreview: 'Live local preview',
        overlayLabel: 'Overlay',
        panelOpacityLabel: 'Panel opacity',
        blurLabel: 'Blur',
        fitLabel: 'Fit',
        accentLabel: 'Accent',
        positionLabel: 'Position',
        cdpPortLabel: 'CDP port',
        saveSettings: 'Save Settings',
        dryRun: 'Dry Run',
        status: 'Status',
        previewTitle: 'Preview',
        previewHint: 'Approximate Codex surface',
        actionsTitle: 'Codex Actions',
        manualConfirm: 'Manual confirmation required',
        savedHooks: 'saved hooks',
        imageBytes: 'image bytes',
        cdpPortMetric: 'CDP port',
        applyPreview: 'Apply Preview',
        applyPersistent: 'Apply Persistent',
        clearCodex: 'Clear Codex UI',
        reloadConfig: 'Reload Config',
        ready: 'Ready.',
        configLoaded: 'Config loaded.',
        settingsSaved: 'Settings saved.',
        unsaved: 'unsaved',
        applyPreviewConfirm: 'Apply Preview will modify the current Codex UI, without persistence. Continue?',
        applyPersistentConfirm: 'Apply Persistent will modify the current Codex UI and register a reload hook. Continue?',
        clearConfirm: 'Clear will modify the current Codex UI and remove saved reload hooks when possible. Continue?'
      }
    };

    function t(key) {
      return (i18n[lang] && i18n[lang][key]) || i18n.zh[key] || key;
    }

    function applyLanguage(nextLang) {
      lang = nextLang === 'en' ? 'en' : 'zh';
      localStorage.setItem('codex-background-lite-lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      els.langZh.classList.toggle('active', lang === 'zh');
      els.langEn.classList.toggle('active', lang === 'en');
      document.querySelectorAll('[data-i18n]').forEach((node) => {
        node.textContent = t(node.getAttribute('data-i18n'));
      });
      refreshDynamicText();
      if (els.log.textContent === i18n.zh.ready || els.log.textContent === i18n.en.ready) {
        log(t('ready'));
      }
    }

    function refreshDynamicText() {
      if (pendingImage) {
        els.imageMeta.textContent = pendingImage.name + ' (' + t('unsaved') + ')';
        return;
      }
      els.imageMeta.textContent = current?.config?.image ? current.config.image.name : t('noImage');
    }

    els.langZh.addEventListener('click', () => applyLanguage('zh'));
    els.langEn.addEventListener('click', () => applyLanguage('en'));

    function log(value) {
      els.log.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
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

    function syncRange(a, b) {
      a.addEventListener('input', () => { b.value = a.value; paintPreview(); });
      b.addEventListener('input', () => { a.value = b.value; paintPreview(); });
    }

    syncRange(els.overlay, els.overlayValue);
    syncRange(els.panelOpacity, els.panelOpacityValue);
    syncRange(els.blur, els.blurValue);
    [els.fit, els.position, els.accent].forEach((el) => el.addEventListener('input', paintPreview));

    async function api(path, options = {}) {
      const response = await fetch(path, {
        method: options.method || 'GET',
        headers: options.body ? { 'content-type': 'application/json' } : {},
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      const data = await response.json();
      if (!response.ok || data.ok === false) throw new Error(data.error || response.statusText);
      return data;
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

    function paintPreview() {
      const theme = themeFromInputs();
      const imageUrl = pendingImage?.dataUrl || (current?.config?.image ? '/api/image?ts=' + encodeURIComponent(current.config.image.savedAt || '') : '');
      els.preview.style.backgroundImage = imageUrl
        ? 'linear-gradient(rgba(0,0,0,' + theme.overlayOpacity + '), rgba(0,0,0,' + theme.overlayOpacity + ')), url("' + imageUrl + '")'
        : 'linear-gradient(rgba(0,0,0,' + theme.overlayOpacity + '), rgba(0,0,0,' + theme.overlayOpacity + '))';
      els.preview.style.backgroundSize = 'cover, ' + theme.fit;
      els.preview.style.backgroundPosition = 'center, ' + (theme.position || 'center top');
      document.querySelectorAll('.side,.main,.composer').forEach((node) => {
        node.style.background = 'rgba(17,24,39,' + theme.panelOpacity + ')';
        node.style.backdropFilter = 'blur(' + theme.blur + 'px) saturate(120%)';
        node.style.webkitBackdropFilter = 'blur(' + theme.blur + 'px) saturate(120%)';
        node.style.borderColor = colorWithAlpha(theme.accent, 0.35);
      });
    }

    function colorWithAlpha(hex, alpha) {
      const value = hex.replace('#', '');
      const r = parseInt(value.slice(0, 2), 16);
      const g = parseInt(value.slice(2, 4), 16);
      const b = parseInt(value.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function updateMetrics(data) {
      current = data;
      els.configPath.textContent = data.paths.config;
      els.regCount.textContent = data.state.registrationCount;
      els.portMetric.textContent = data.config.cdpPort;
      els.cdpPort.value = data.config.cdpPort;
      els.lastBytes.textContent = data.config.image?.bytes || 0;
      refreshDynamicText();
      setTheme(data.config.theme);
    }

    async function load() {
      pendingImage = null;
      updateMetrics(await api('/api/config'));
      log(t('configLoaded'));
    }

    async function save() {
      const body = {
        cdpPort: Number(els.cdpPort.value),
        theme: themeFromInputs()
      };
      if (pendingImage) {
        body.imageDataUri = pendingImage.dataUrl;
        body.imageName = pendingImage.name;
      }
      pendingImage = null;
      updateMetrics(await api('/api/config', { method: 'POST', body }));
      log(t('settingsSaved'));
    }

    els.imageInput.addEventListener('change', async () => {
      const file = els.imageInput.files[0];
      if (!file) return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      pendingImage = { name: file.name, dataUrl };
      refreshDynamicText();
      paintPreview();
    });

    document.getElementById('saveBtn').addEventListener('click', () => save().catch((error) => log(error.message)));
    document.getElementById('reloadBtn').addEventListener('click', () => load().catch((error) => log(error.message)));
    document.getElementById('dryRunBtn').addEventListener('click', async () => {
      try {
        await save();
        log(await api('/api/dry-run', { method: 'POST' }));
      } catch (error) {
        log(error.message);
      }
    });
    document.getElementById('statusBtn').addEventListener('click', async () => {
      try {
        await save();
        log(await api('/api/status', { method: 'POST' }));
      } catch (error) {
        log(error.message);
      }
    });
    document.getElementById('applyPreviewBtn').addEventListener('click', async () => {
      if (!confirm(t('applyPreviewConfirm'))) return;
      try {
        await save();
        log(await api('/api/apply-preview', { method: 'POST' }));
      } catch (error) {
        log(error.message);
      }
    });
    document.getElementById('applyPersistBtn').addEventListener('click', async () => {
      if (!confirm(t('applyPersistentConfirm'))) return;
      try {
        await save();
        log(await api('/api/apply-persistent', { method: 'POST' }));
      } catch (error) {
        log(error.message);
      }
    });
    document.getElementById('clearBtn').addEventListener('click', async () => {
      if (!confirm(t('clearConfirm'))) return;
      try {
        await save();
        log(await api('/api/clear', { method: 'POST' }));
      } catch (error) {
        log(error.message);
      }
    });

    applyLanguage(lang);
    load().catch((error) => log(error.message));
  </script>
</body>
</html>`;
}
