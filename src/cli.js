#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { applyBackground, buildDryRunScript, clearBackground, status } from "./cdp.js";
import { imageFileToDataUri } from "./image.js";
import { restartCodexWithCdp } from "./launcher.js";
import { stateFilePath } from "./state.js";
import { startUiServer } from "./ui-server.js";

function usage() {
  return `codex-background-lite

Usage:
  node src/cli.js dry-run --image <path> [--out <path>] [theme options]
  node src/cli.js status [--port 9222]
  node src/cli.js restart-codex [--port 9222]
  node src/cli.js apply --image <path> [--port 9222] [--no-persist] [theme options]
  node src/cli.js clear [--port 9222]
  node src/cli.js ui [--ui-port 17837] [--host 127.0.0.1]

Theme options:
  --overlay <0..0.9>       Darkness over the image. Default: 0.42
  --panel-opacity <0..1>   Panel opacity. Default: 0.62
  --blur <px>              Panel blur. Default: 5
  --fit <cover|contain|auto>
                           Background fit. Default: cover
  --position <css value>   Background position. Default: "center top"
  --accent <#rrggbb>       Accent color. Default: #7dd3fc
  --force-large            Allow images above 12 MB

Safety:
  dry-run only writes the generated injection JavaScript to disk/stdout.
  ui starts a local settings page but does not apply anything by itself.
  restart-codex changes the running Codex process.
  status, apply, and clear are the only commands that contact Codex Desktop CDP.`;
}

function parseArgs(argv) {
  const command = argv[2];
  const flags = {};
  const positional = [];
  for (let i = 3; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "no-persist" || key === "force-large" || key === "help") {
      flags[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    flags[key] = next;
    i += 1;
  }
  return { command, flags, positional };
}

function numberFlag(flags, name, fallback) {
  if (flags[name] === undefined) return fallback;
  const value = Number(flags[name]);
  if (!Number.isFinite(value)) throw new Error(`--${name} must be a number`);
  return value;
}

function themeOptionsFromFlags(flags) {
  return {
    overlayOpacity: numberFlag(flags, "overlay", undefined),
    panelOpacity: numberFlag(flags, "panel-opacity", undefined),
    blur: numberFlag(flags, "blur", undefined),
    fit: flags.fit,
    position: flags.position,
    accent: flags.accent
  };
}

function portFromFlags(flags) {
  const port = Number(flags.port ?? 9222);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("--port must be an integer between 1 and 65535");
  }
  return port;
}

function uiPortFromFlags(flags) {
  const port = Number(flags["ui-port"] ?? 17837);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("--ui-port must be an integer between 1 and 65535");
  }
  return port;
}

function hostFromFlags(flags) {
  const host = String(flags.host ?? "127.0.0.1").trim();
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error("--host is limited to 127.0.0.1 or localhost");
  }
  return host;
}

async function writeOutput(path, text) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, text, "utf8");
  return absolute;
}

async function runDryRun(flags) {
  if (!flags.image) throw new Error("dry-run requires --image <path>");
  const image = await imageFileToDataUri(flags.image, { forceLarge: flags["force-large"] === true });
  const script = buildDryRunScript(image.dataUri, themeOptionsFromFlags(flags));
  if (flags.out) {
    const absolute = await writeOutput(flags.out, `${script}\n`);
    console.log(JSON.stringify({
      ok: true,
      mode: "dry-run",
      wrote: absolute,
      imagePath: image.absolutePath,
      imageBytes: image.byteLength
    }, null, 2));
  } else {
    console.log(script);
  }
}

async function runStatus(flags) {
  const result = await status(portFromFlags(flags));
  console.log(JSON.stringify(result, null, 2));
}

async function runApply(flags) {
  if (!flags.image) throw new Error("apply requires --image <path>");
  const result = await applyBackground({
    imagePath: flags.image,
    port: portFromFlags(flags),
    persist: flags["no-persist"] !== true,
    forceLarge: flags["force-large"] === true,
    themeOptions: themeOptionsFromFlags(flags)
  });
  console.log(JSON.stringify({ ok: true, ...result, stateFile: stateFilePath() }, null, 2));
}

async function runRestartCodex(flags) {
  const result = await restartCodexWithCdp({ port: portFromFlags(flags) });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

async function runClear(flags) {
  const result = await clearBackground({ port: portFromFlags(flags) });
  console.log(JSON.stringify({ ok: true, ...result, stateFile: stateFilePath() }, null, 2));
}

async function runUi(flags) {
  const result = await startUiServer({
    host: hostFromFlags(flags),
    uiPort: uiPortFromFlags(flags)
  });
  console.log(JSON.stringify({
    ok: true,
    mode: "ui",
    url: result.url,
    safety: "The page does not apply anything until you press Apply Preview, Apply Persistent, or Clear."
  }, null, 2));
}

async function main() {
  const { command, flags } = parseArgs(process.argv);
  if (!command || command === "help" || command === "--help" || command === "-h" || flags.help) {
    console.log(usage());
    return;
  }

  switch (command) {
    case "dry-run":
      await runDryRun(flags);
      break;
    case "status":
      await runStatus(flags);
      break;
    case "restart-codex":
      await runRestartCodex(flags);
      break;
    case "apply":
      await runApply(flags);
      break;
    case "clear":
      await runClear(flags);
      break;
    case "ui":
      await runUi(flags);
      break;
    default:
      throw new Error(`Unknown command "${command}".\n\n${usage()}`);
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
