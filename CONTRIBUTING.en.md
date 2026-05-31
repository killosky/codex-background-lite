# Contributing

中文版本：[CONTRIBUTING.md](CONTRIBUTING.md)

Thank you for considering a contribution to `codex-background-lite`.

## Project Scope

The project does one thing: it applies a background image to Codex Desktop through a standalone Windows desktop app.

Please do not add these areas to this project:

- provider management
- account switching
- proxy configuration
- Codex updater
- automatic startup background restore
- modification of Codex installation files

## Development Commands

```powershell
npm install
npm run desktop
npm run check
```

Packaging:

```powershell
npm run pack:win
npm run dist:win
```

## Submission Requirements

- User-facing documentation should keep Chinese as the primary language and include English counterparts where practical.
- Update documentation when changing CDP, process launch, or config persistence logic.
- Add or update tests when changing theme script generation logic.
- Do not commit generated outputs such as `node_modules/`, `dist/`, or `.tmp/`.
- If a change can interrupt the current Codex process, the UI must ask the user for confirmation.
