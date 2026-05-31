# Security

中文版本：[SECURITY.md](SECURITY.md)

## Current Security Model

`codex-background-lite` does not modify Codex Desktop installation files. When applying a background, it only connects to the local CDP port and injects removable CSS into the current Codex Electron renderer.

## Sensitive Operations

- `Apply to Codex`: modifies the current Codex interface through CDP.
- `Clear Background`: removes the injected background style from the current Codex interface through CDP.
- `Check Status`: only reads local CDP target information.
- `Start / Restart Codex`: closes the current Windows Codex process and restarts it with CDP arguments. This may interrupt the current conversation.

## CDP Risk

The CDP debugging port has high privileges. Use it only in a trusted local environment, and do not expose the port to a LAN or the public internet.

Common arguments:

```text
--remote-debugging-port=9222 --remote-allow-origins=*
```

If you no longer need the background feature, fully exit Codex and reopen it normally so it runs without CDP arguments.

## Local Data

Config and images are stored in the current user profile:

```text
~\.codex-background-lite\
```

The tool does not upload images or config.

## Reporting Security Issues

If you find a security issue, please contact the maintainer privately first and avoid publishing exploit details directly.
