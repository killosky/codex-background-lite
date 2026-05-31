# Changelog

中文版本：[CHANGELOG.md](CHANGELOG.md)

## 0.1.2

- Integrated Apply to Codex into the setup workflow: save settings, check the CDP connection, confirm a Codex restart when needed, wait for the port, then continue applying the background automatically.
- Updated the current mode copy to clarify that after Codex fully exits or the computer restarts, users only need to click Apply to Codex again instead of remembering a manual status-check sequence.

## 0.1.1

- Added Simplified Chinese / English switching in the desktop app.
- Added English README, architecture guide, desktop app guide, security notes, contributing guide, and changelog.
- Documented why the Electron installer and unpacked app directory are large.

## 0.1.0

- Added the standalone Windows desktop app.
- Added image selection and persistence to the local config directory.
- Added controls for overlay opacity, panel opacity, blur, image fit, image position, and accent color.
- Added CDP-based background application to the current Codex Desktop window.
- Added background style clearing for the current Codex window.
- Added support for starting or restarting the Windows Store/MSIX Codex app with CDP arguments.
- Removed the first web console, startup restore, and restore flows.
- Kept the minimal CLI as a development and troubleshooting helper.
