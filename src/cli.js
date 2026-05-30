#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { applyBackground, buildDryRunScript, clearBackground, status } from "./cdp.js";
import { imageFileToDataUri } from "./image.js";
import { restartCodexWithCdp } from "./launcher.js";
import { stateFilePath } from "./state.js";

function usage() {
  return `codex-background-lite 辅助命令

桌面应用是当前唯一推荐使用方式：
  npm run desktop
  npm run dist:win

辅助命令：
  node src/cli.js dry-run --image <path> [--out <path>] [theme options]
  node src/cli.js status [--port 9222]
  node src/cli.js restart-codex [--port 9222]
  node src/cli.js apply --image <path> [--port 9222] [theme options]
  node src/cli.js clear [--port 9222]

主题参数：
  --overlay <0..0.9>       背景遮罩，默认 0.42
  --panel-opacity <0..1>   面板透明度，默认 0.62
  --blur <px>              面板模糊，默认 5
  --fit <cover|contain|auto>
                           背景适配方式，默认 cover
  --position <css value>   背景位置，默认 "center top"
  --accent <#rrggbb>       强调色，默认 #7dd3fc
  --force-large            允许超过 12 MB 的图片

说明：
  dry-run 只生成注入脚本，不连接 Codex。
  status、apply、clear 会连接 Codex Desktop CDP。
  restart-codex 会关闭并重新启动 Codex Desktop。`;
}

function parseArgs(argv) {
  const command = argv[2];
  const flags = {};
  for (let i = 3; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (key === "force-large" || key === "help") {
      flags[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`缺少 --${key} 的参数值`);
    }
    flags[key] = next;
    i += 1;
  }
  return { command, flags };
}

function numberFlag(flags, name, fallback) {
  if (flags[name] === undefined) return fallback;
  const value = Number(flags[name]);
  if (!Number.isFinite(value)) throw new Error(`--${name} 必须是数字`);
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
    throw new Error("--port 必须是 1 到 65535 之间的整数");
  }
  return port;
}

async function writeOutput(path, text) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, text, "utf8");
  return absolute;
}

async function runDryRun(flags) {
  if (!flags.image) throw new Error("dry-run 需要 --image <path>");
  const image = await imageFileToDataUri(flags.image, { forceLarge: flags["force-large"] === true });
  const script = buildDryRunScript(image.dataUri, themeOptionsFromFlags(flags));
  if (!flags.out) {
    console.log(script);
    return;
  }
  const absolute = await writeOutput(flags.out, `${script}\n`);
  console.log(JSON.stringify({
    ok: true,
    mode: "dry-run",
    wrote: absolute,
    imagePath: image.absolutePath,
    imageBytes: image.byteLength
  }, null, 2));
}

async function runStatus(flags) {
  console.log(JSON.stringify(await status(portFromFlags(flags)), null, 2));
}

async function runApply(flags) {
  if (!flags.image) throw new Error("apply 需要 --image <path>");
  const result = await applyBackground({
    imagePath: flags.image,
    port: portFromFlags(flags),
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
    default:
      throw new Error(`未知命令：${command}\n\n${usage()}`);
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
