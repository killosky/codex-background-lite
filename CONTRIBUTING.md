# Contributing

Thanks for considering a contribution.

This project is intentionally small. Please keep changes focused on the standalone background-theme workflow and avoid adding provider, account, proxy, or updater features.

## Development

Requirements:

- Node.js 20 or newer
- Windows for `restart-codex`

Useful commands:

```powershell
npm run check
npm test
node src/cli.js dry-run --image C:\path\to\background.jpg --out .\tmp\inject.js
```

## Pull Requests

- Keep public-facing behavior documented in both `README.md` and `README.en.md`.
- Add or update tests for input validation, generated script behavior, and CLI-safe paths.
- Do not commit generated files from `.tmp/`.
- Be explicit when a change touches CDP, process launching, or local UI actions.
