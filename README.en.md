# codex-background-lite

[中文](README.md) | English

`codex-background-lite` is a lightweight Codex Desktop background-theme tool. It connects to a running Codex Desktop Electron renderer through the local Chrome DevTools Protocol (CDP), injects one removable `<style>` tag, and uses that tag to apply a background image plus translucent panel styling.

> Status: experimental `0.1.x`. The current target is Windows Store/MSIX Codex Desktop. Read the safety notes before enabling CDP.

## Features

- Inject a background image through CDP without modifying Codex Desktop binaries.
- Apply transparent/frosted panel CSS for Codex Desktop.
- Apply a temporary preview or persist with `Page.addScriptToEvaluateOnNewDocument` across renderer reloads.
- Clear saved reload hooks with `Page.removeScriptToEvaluateOnNewDocument`.
- Use a local settings UI to choose an image, tune options, save config, and run dry-run checks.

This project only keeps the background-theme workflow. Provider, proxy, account switching, updater, and other larger features from the reference project are intentionally not included.

## Acknowledgements

The idea for this project comes from the Codex Desktop background-theme work in [cmochance/codex-app-transfer](https://github.com/cmochance/codex-app-transfer). Thanks to the original project author for the exploration and implementation reference.

## Safety

Local-only commands that generate or inspect output without contacting Codex Desktop:

```powershell
node src/cli.js dry-run --image C:\path\to\background.jpg --out .\generated-inject.js
node src/cli.js ui --ui-port 17837
npm run check
```

Commands that contact Codex Desktop through CDP but do not restart it:

```powershell
node src/cli.js status --port 9222
node src/cli.js clear --port 9222
node src/cli.js apply --image C:\path\to\background.jpg --port 9222
```

Operations that modify the current Codex UI:

- `apply`: injects the background style into the current renderer. By default it also registers a reload hook.
- `clear`: removes the current style tag and removes saved reload hooks when possible.
- The local UI buttons `Apply Preview`, `Apply Persistent`, and `Clear Codex UI`: after confirmation they call the same capabilities.

Command that restarts Codex Desktop:

```powershell
node src/cli.js restart-codex --port 9222
```

Run `restart-codex` only when you are ready for the current Codex Desktop process to be closed and reopened with CDP enabled.

CDP exposes powerful debugging capabilities. Enable it only for local, trusted use, and restart Codex Desktop normally when you no longer need the debugging port. See [SECURITY.md](SECURITY.md) for more detail.

## Requirements

Node.js 20 or newer is required.

`status`, `apply`, and `clear` require Codex Desktop to already be running with a CDP port, usually:

```text
--remote-debugging-port=9222 --remote-allow-origins=*
```

This standalone version includes a small PowerShell + C# COM launcher for Windows Store/MSIX Codex:

```powershell
node src/cli.js restart-codex --port 9222
```

The launcher is currently implemented only for Windows MSIX Codex.

## Usage

No install step is required for runtime dependencies; the project has none. Run it directly with Node.js:

```powershell
node src/cli.js --help
```

Generate the injection script without applying it:

```powershell
node src/cli.js dry-run --image C:\path\to\bg.jpg --out .\tmp\inject.js
```

Open the local settings page without applying anything automatically:

```powershell
node src/cli.js ui --ui-port 17837 --host 127.0.0.1
```

The local settings page defaults to Chinese and provides a `中文 / English` switch in the header. The language preference is stored only in browser `localStorage`; it is not written to the theme config.

Check whether a CDP target is visible:

```powershell
node src/cli.js status --port 9222
```

Restart Windows Store/MSIX Codex with a CDP port:

```powershell
node src/cli.js restart-codex --port 9222
```

Apply a background:

```powershell
node src/cli.js apply --image C:\path\to\bg.jpg --overlay 0.42 --panel-opacity 0.62 --blur 5
```

Apply only to the current renderer, without persistence across reloads:

```powershell
node src/cli.js apply --image C:\path\to\bg.jpg --no-persist
```

Clear the current background and remove registered reload hooks:

```powershell
node src/cli.js clear --port 9222
```

## Theme Options

- `--overlay <0..0.9>`: darkness over the image, default `0.42`.
- `--panel-opacity <0..1>`: opacity of Codex panels, default `0.62`.
- `--blur <px>`: frosted glass blur, default `5`.
- `--fit <cover|contain|auto>`: background fit, default `cover`.
- `--position <css value>`: background position, default `center top`. Unsafe CSS characters are ignored and replaced with the default.
- `--accent <#rrggbb>`: accent color, default `#7dd3fc`.
- `--force-large`: allow image files above the default 12 MB CDP payload limit.

## State Files

Persistent CDP registration identifiers are stored in:

```text
~/.codex-background-lite/state.json
```

The local settings page stores copied images and theme configuration in:

```text
~/.codex-background-lite/config.json
~/.codex-background-lite/images/
```

The browser file picker does not expose the original file path. The image is copied into the `images` directory above before dry-run or apply uses it.

## Development

```powershell
npm run check
npm test
```

If PowerShell reports `npm.ps1 cannot be loaded because running scripts is disabled`, use:

```powershell
npm.cmd run check
```

## Recommended Workflow

1. Run `npm run check`.
2. Run `node src/cli.js ui`, choose an image, and tune the theme options.
3. Use `Save Settings` or `Dry Run` first. These do not modify Codex UI.
4. Start or restart Codex with CDP enabled only when you are ready for that UI impact.
5. Use `Status` in the local UI to confirm the target.
6. Use `Apply Preview` first if you want a non-persistent preview.
7. Use `Apply Persistent` when you want the background to survive renderer reloads.
