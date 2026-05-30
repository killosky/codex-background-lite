const STYLE_ID = "codex-background-lite-style";

function clampNumber(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function cssPosition(value) {
  if (typeof value !== "string") return "center top";
  const trimmed = value.trim();
  if (!trimmed) return "center top";
  if (trimmed.length > 80) return "center top";
  if (!/^[a-zA-Z0-9\s.%+\-(),/]+$/.test(trimmed)) return "center top";
  return trimmed;
}

export function normalizeThemeOptions(options = {}) {
  return {
    overlayOpacity: clampNumber(options.overlayOpacity, 0.42, 0, 0.9),
    panelOpacity: clampNumber(options.panelOpacity, 0.62, 0.05, 0.95),
    blur: clampNumber(options.blur, 5, 0, 32),
    fit: ["cover", "contain", "auto"].includes(options.fit) ? options.fit : "cover",
    position: cssPosition(options.position),
    accent: /^#[0-9a-fA-F]{6}$/.test(options.accent || "") ? options.accent : "#7dd3fc"
  };
}

export function buildInjectScript(dataUri, rawOptions = {}) {
  const options = normalizeThemeOptions(rawOptions);
  const themeMeta = JSON.stringify({
    source: "codex-background-lite",
    appliedAt: new Date().toISOString()
  });

  return `
(function() {
  var oldStyle = document.getElementById(${JSON.stringify(STYLE_ID)});
  if (oldStyle) oldStyle.remove();

  var style = document.createElement('style');
  style.id = ${JSON.stringify(STYLE_ID)};
  style.setAttribute('data-codex-background-lite', ${themeMeta});
  style.textContent = \`
    body {
      background-color: #111827 !important;
      background-image:
        linear-gradient(rgba(0, 0, 0, ${options.overlayOpacity}), rgba(0, 0, 0, ${options.overlayOpacity})),
        url('${dataUri}') !important;
      background-size: cover, ${options.fit} !important;
      background-position: center, ${options.position} !important;
      background-repeat: no-repeat, no-repeat !important;
      background-attachment: fixed, fixed !important;
    }

    #root,
    .app-shell,
    .app-shell-main,
    main.main-surface {
      background: transparent !important;
    }

    :root {
      --color-token-main-surface-primary: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-token-bg-primary: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-token-side-bar-background: rgba(10, 15, 28, ${Math.min(0.92, options.panelOpacity + 0.1)}) !important;
      --color-token-editor-background: rgba(17, 24, 39, ${Math.max(0.2, options.panelOpacity - 0.18)}) !important;
      --color-token-input-background: rgba(255, 255, 255, 0.08) !important;
      --color-background-surface: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-panel: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-elevated-primary: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-elevated-primary-opaque: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-elevated-secondary: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-elevated-secondary-opaque: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-control: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-background-control-opaque: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-token-bg-fog: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-token-dropdown-background: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      --color-token-border: rgba(255, 255, 255, 0.14) !important;
      --color-token-border-heavy: rgba(255, 255, 255, 0.24) !important;
      --color-token-border-light: rgba(255, 255, 255, 0.08) !important;
      --color-border: rgba(255, 255, 255, 0.14) !important;
      --color-border-heavy: rgba(255, 255, 255, 0.24) !important;
      --color-border-light: rgba(255, 255, 255, 0.08) !important;
      --color-token-foreground: #f8fafc !important;
      --color-token-text-primary: #f8fafc !important;
      --color-token-text-secondary: rgba(226, 232, 240, 0.78) !important;
      --color-text-foreground: #f8fafc !important;
      --color-text-foreground-secondary: rgba(226, 232, 240, 0.78) !important;
      --color-text-foreground-tertiary: rgba(203, 213, 225, 0.58) !important;
      --color-icon-primary: #f8fafc !important;
      --color-icon-secondary: rgba(226, 232, 240, 0.78) !important;
      --color-icon-tertiary: rgba(203, 213, 225, 0.58) !important;
      --color-token-primary: ${options.accent} !important;
      --color-token-link: ${options.accent} !important;
      --color-token-text-link-foreground: ${options.accent} !important;
      --color-token-focus-border: ${options.accent} !important;
      --color-token-scrollbar-slider-background: rgba(255, 255, 255, 0.22) !important;
      --color-token-scrollbar-slider-hover-background: rgba(255, 255, 255, 0.36) !important;
      --color-token-list-hover-background: rgba(255, 255, 255, 0.11) !important;
    }

    .app-shell-left-panel,
    .composer-root,
    .thread-root,
    .editor-container,
    .dialog-layout,
    [role="menu"],
    [role="listbox"],
    [role="dialog"],
    [data-radix-menu-content],
    [data-browser-comment-editor-surface],
    .bg-token-dropdown-background {
      background-color: rgba(17, 24, 39, ${options.panelOpacity}) !important;
      backdrop-filter: blur(${options.blur}px) saturate(120%) !important;
      -webkit-backdrop-filter: blur(${options.blur}px) saturate(120%) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }

    .app-shell-left-panel,
    .composer-root,
    .thread-root,
    .editor-container,
    .dialog-layout,
    [data-browser-comment-editor-surface] {
      box-shadow: none !important;
      mask: none !important;
      -webkit-mask: none !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }

    .app-shell-left-panel::before,
    .app-shell-left-panel::after,
    .thread-root::before,
    .thread-root::after,
    .composer-root::before,
    .composer-root::after,
    .editor-container::before,
    .editor-container::after,
    .app-shell-main::before,
    .app-shell-main::after,
    [data-panel-resize-handle],
    [data-panel-resize-handle-id],
    [data-panel-group],
    [data-resize-handle],
    [role="separator"],
    .split-pane-divider,
    .app-shell-divider,
    .resize-handle,
    .resizable-handle {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
      mask: none !important;
      -webkit-mask: none !important;
      filter: none !important;
    }
  \`;
  document.head.appendChild(style);
  return true;
})();`;
}

export function buildClearScript() {
  return `
(function() {
  var style = document.getElementById(${JSON.stringify(STYLE_ID)});
  if (style) style.remove();
  return true;
})();`;
}
