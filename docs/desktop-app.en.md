# Codex Background Lite Desktop App

中文版本：[desktop-app.md](desktop-app.md)

The project contains a standalone Windows desktop app built with Electron.

## Daily Usage

1. Open `Codex Background Lite`.
2. Choose a PNG, JPEG, or WebP image.
3. Adjust overlay opacity, panel opacity, blur, image fit, image position, accent color, and CDP port.
4. If the status says Codex is not connected, click `Start / Restart Codex`.
5. Click `Apply to Codex`.

The app uses the local CDP port to inject CSS into the currently running Codex renderer. It does not modify Codex installation files.

If Codex fully exits, updates, or the computer restarts, the background may disappear. This is accepted behavior in the current version. To restore the background, reopen the app and click `Apply to Codex`.

## UI Controls

- `Apply to Codex`: saves the current settings and applies the background to the current Codex window.
- `Check Status`: checks whether the CDP port can find a Codex page target.
- `Clear Background`: removes the injected background style from the current Codex window.
- `Save Settings`: saves the image and options without modifying Codex.
- `Start / Restart Codex`: closes the current Codex process and restarts it with CDP arguments. This may interrupt the current conversation.
- `Open Config Folder`: opens the config file location in File Explorer.
- Language selector: switches the UI between Simplified Chinese and English. The selection is stored locally.

## Development

```powershell
npm install
npm run desktop
```

## Packaging

Build the portable unpacked app:

```powershell
npm run pack:win
```

Build the Windows installer:

```powershell
npm run dist:win
```

## Current Build Outputs

- Portable unpacked app: `dist\win-unpacked\Codex Background Lite.exe`
- Installer: `dist\Codex Background Lite Setup 0.1.1.exe`

## Why the App Is Large

The desktop app is built with Electron. Electron brings Chromium and Node.js into the app directory:

- Chromium renders the desktop interface.
- Node.js provides local file, config, process launch, and CDP access.
- electron-builder downloads additional Windows packaging binaries.

The size mainly comes from runtime and packaging files, not from the business logic. The `src/` code is only tens of KB, but an unpacked Electron app often exceeds 200 MB.

Common size sources:

```text
dist\win-unpacked\Codex Background Lite.exe    Electron main executable and Chromium runtime
dist\win-unpacked\*.dll                        GPU, Vulkan, DirectX, ffmpeg, and other runtime libraries
dist\win-unpacked\locales\                     Chromium locale resources
node_modules\electron\                         Development-time Electron dependency
node_modules\app-builder-bin\                  Packaging tool binaries
```

The Electron version is kept because it already provides a complete desktop UI, file picker, preview, IPC, safety bridge, Windows installer, and Codex launch flow. For the first version of this app, that is more stable than rewriting the UI natively.

## Download Mirrors

The project configures Electron and electron-builder to use mirror URLs because the current network environment may time out when downloading Electron binaries from GitHub.
