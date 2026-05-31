# Architecture

中文版本：[architecture.md](architecture.md)

`codex-background-lite` currently uses an Electron desktop app as its only official entry point. The app does not modify Codex installation files. It only connects to the local CDP debugging port and injects CSS into the current Codex Electron renderer.

## Modules

```text
src/desktop/main.js       Electron main process: IPC, config I/O, CDP actions, and Codex launch
src/desktop/preload.cjs   Safe bridge exposing only the required API to the renderer
src/desktop/renderer.*    Desktop UI, preview, language switching, and user interaction
src/cdp.js                CDP HTTP target discovery, WebSocket commands, style injection, and clearing
src/config.js             Config file, image copy, and config merge
src/image.js              Image type detection, size limits, and data URI conversion
src/launcher.js           Windows Store/MSIX Codex launch logic
src/state.js              Local state file
src/theme-script.js       JavaScript and CSS generated for injection into Codex
src/cli.js                Debug helper commands, not a primary product entry point
```

## Runtime Flow

1. The user chooses an image and theme settings in the desktop app.
2. The main process copies the image to `~\.codex-background-lite\images\`.
3. The config is written to `~\.codex-background-lite\config.json`.
4. The user clicks `Apply to Codex`.
5. The main process uses `src/cdp.js` to locate the Codex CDP target.
6. `src/theme-script.js` generates the injection script from the image and options.
7. CDP `Runtime.evaluate` applies the style to the current Codex window.

## Why the Background Is Not Permanent

The current version accepts that the background may disappear after Codex exits or the computer restarts. This avoids:

- Modifying Codex installation files.
- Running a resident background process.
- Adding startup restore scripts.
- Leaving stale state after Codex updates.

When needed, the user can reopen this app and click `Apply to Codex`.

## Size Source

The app size is mainly determined by the Electron runtime. The business code, theme script, and CDP logic are small, but Electron ships Chromium, Node.js, GPU/media DLLs, locale resources, and runtime packaging files.

This means:

- An installer in the tens of MB is normal.
- An unpacked Windows app directory in the 200 MB range is typical for Electron.
- The development folder is larger because it also contains `node_modules\electron` and `node_modules\app-builder-bin`.

The project accepts this size cost because the first version already has a complete desktop UI, installer, file picker, preview, IPC flow, and Codex launch workflow.

## Security Boundary

- The app only connects to a local CDP port.
- Images and config are stored only in the current user's profile directory.
- `Start / Restart Codex` is the only operation that closes Codex processes, and the UI must ask for confirmation.
- Startup restore is no longer provided.
