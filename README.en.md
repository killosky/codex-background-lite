# codex-background-lite

中文文档：[README.md](README.md)

`codex-background-lite` is a standalone Windows desktop app for adding a custom background image to Codex Desktop. It does not modify the Codex installation files. Instead, it connects to the local Chrome DevTools Protocol (CDP) port and injects removable CSS into the current Codex Electron renderer.

The project has removed the earlier web restore and startup restore flows. The desktop app is the only official entry point.

## Use Cases

- You want to set a custom background image for Codex Desktop.
- You can accept that the background may disappear after Codex exits, updates, or the computer restarts.
- You prefer opening this app and clicking `Apply to Codex` whenever you need to restore the background.
- You need either a Chinese or English interface. The app chooses a language from the system/browser locale and also provides a manual language switch in the top-right corner.

## Quick Start

Installer:

```text
dist\Codex Background Lite Setup 0.1.1.exe
```

Portable unpacked build:

```text
dist\win-unpacked\Codex Background Lite.exe
```

Usage:

1. Open `Codex Background Lite`.
2. Choose a PNG, JPEG, or WebP image.
3. Adjust overlay opacity, panel opacity, blur, image fit, image position, accent color, and CDP port.
4. If the status says Codex is not connected, click `Start / Restart Codex`.
5. Click `Apply to Codex`.

If Codex fully exits, updates, or the computer restarts, the background may disappear. Open this app again and click `Apply to Codex` to restore it.

## Size Notes

The app's feature code is small; the `src/` directory is only tens of KB. The installer and installed app directory are large because the desktop shell uses Electron.

Electron apps ship a full Chromium and Node.js runtime. Chromium renders the interface, while Node.js provides local file, process, and CDP access. This makes the app practical to build and package with web technology, but it is much larger than a native utility.

Typical build sizes:

```text
dist\Codex Background Lite Setup 0.1.1.exe    about 75 MB
dist\win-unpacked\                            about 258 MB
```

The development folder is larger because it also contains dependencies and packaging tools:

```text
node_modules\electron\        Electron/Chromium runtime
node_modules\app-builder-bin\ electron-builder packaging binaries
dist\win-unpacked\            unpacked Windows app
```

The 200 MB class size mainly comes from Electron/Chromium runtime files and build outputs, not from the background injection feature itself. The project keeps Electron because the first version already provides a complete UI, installer, IPC flow, process integration, and packaging workflow.

## Features

- Choose and persist a background image.
- Adjust overlay opacity, panel opacity, blur, image fit, image position, and accent color.
- Check the Codex CDP connection status.
- Start or restart the Windows Store/MSIX Codex app with CDP arguments.
- Apply the background to the current Codex window.
- Clear the injected background style from the current Codex window.
- Switch the desktop UI between Simplified Chinese and English.

## Project Structure

```text
src/
  desktop/          Electron desktop UI and IPC
  cdp.js            CDP connection, page selection, style injection, and clearing
  config.js         Local config and image persistence
  image.js          Image validation and data URI conversion
  launcher.js       Windows MSIX Codex launcher
  state.js          Local state file
  theme-script.js   CSS/JS generator injected into Codex
  cli.js            Debug helper commands
test/               Node tests
docs/               Chinese and English documentation
```

Architecture details:

- Chinese: [docs/architecture.md](docs/architecture.md)
- English: [docs/architecture.en.md](docs/architecture.en.md)

Desktop app guide:

- Chinese: [docs/desktop-app.md](docs/desktop-app.md)
- English: [docs/desktop-app.en.md](docs/desktop-app.en.md)

## Development

Requires Node.js 20 or newer.

Install dependencies:

```powershell
npm install
```

Run the desktop app in development:

```powershell
npm run desktop
```

Run checks:

```powershell
npm run check
```

If PowerShell reports `npm.ps1 cannot be loaded because running scripts is disabled`, use:

```powershell
npm.cmd run check
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

## Helper Commands

The desktop app is the official entry point. The CLI is only for development and troubleshooting.

```powershell
node src\cli.js --help
node src\cli.js status --port 9222
node src\cli.js restart-codex --port 9222
node src\cli.js clear --port 9222
```

## Local Config

```text
~\.codex-background-lite\config.json
~\.codex-background-lite\images\
~\.codex-background-lite\state.json
```

## Security

This tool depends on a CDP debugging port. CDP is powerful and should only be used in a trusted local environment. See:

- Chinese: [SECURITY.md](SECURITY.md)
- English: [SECURITY.en.md](SECURITY.en.md)

## License

MIT License. See [LICENSE](LICENSE).

## Credits

The project was inspired by the Codex Desktop background theme exploration in [cmochance/codex-app-transfer](https://github.com/cmochance/codex-app-transfer).
