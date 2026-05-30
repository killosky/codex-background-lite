# Security Policy

## Supported Status

`codex-background-lite` is experimental software. The current supported target is Windows Store/MSIX Codex Desktop launched with a local Chrome DevTools Protocol (CDP) port.

## Security Model

- The tool does not patch or replace Codex Desktop binaries.
- `dry-run` and `ui` do not contact Codex Desktop by themselves.
- `status`, `apply`, and `clear` connect to `127.0.0.1:<port>` CDP.
- `restart-codex` closes the current Windows Codex process and starts it again with CDP flags.
- The local UI is intended to bind only to `127.0.0.1` or `localhost`.

CDP exposes powerful debugging capabilities. Only enable `--remote-debugging-port` for local, trusted use, and close or restart Codex normally when you no longer need it.

## Reporting

Please report security issues privately before opening a public issue. If the GitHub repository has not yet configured private vulnerability reporting, contact the maintainer through their GitHub profile.
