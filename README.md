# codex-background-lite

中文 | [English](README.en.md)

`codex-background-lite` 是一个轻量的 Codex Desktop 背景主题工具。它通过本地 Chrome DevTools Protocol (CDP) 连接正在运行的 Codex Desktop Electron 渲染进程，注入一个可移除的 `<style>` 标签来应用背景图和半透明面板样式。

> 项目状态：实验性 `0.1.x`。当前主要面向 Windows Store/MSIX 版 Codex Desktop。请先阅读安全说明，再决定是否启用 CDP。

## 特性

- 通过 CDP 注入背景图，不修改 Codex Desktop 二进制文件。
- 支持透明/磨砂风格的 Codex 面板 CSS。
- 支持预览式应用，也支持 `Page.addScriptToEvaluateOnNewDocument` 在渲染器 reload 后继续生效。
- 支持 `Page.removeScriptToEvaluateOnNewDocument` 清理已保存的 reload hook。
- 提供本地设置页面，可选择图片、调整参数、保存配置、执行 dry-run。

本项目只保留背景主题相关能力。参考项目中的供应商、代理、账号切换、更新器等功能不包含在这个独立工具里。

## 致谢

这个项目的思路来自 [cmochance/codex-app-transfer](https://github.com/cmochance/codex-app-transfer) 中的 Codex Desktop 背景主题方案。感谢源项目作者提供的探索和实现参考。

## 安全说明

只在本地生成或检查、不接触 Codex Desktop 的命令：

```powershell
node src/cli.js dry-run --image C:\path\to\background.jpg --out .\generated-inject.js
node src/cli.js ui --ui-port 17837
npm run check
```

会通过 CDP 访问 Codex Desktop、但不会重启 Codex 的命令：

```powershell
node src/cli.js status --port 9222
node src/cli.js clear --port 9222
node src/cli.js apply --image C:\path\to\background.jpg --port 9222
```

会修改当前 Codex UI 的操作：

- `apply`：向当前渲染器注入背景样式。默认还会注册 reload hook。
- `clear`：移除当前样式标签，并尽可能移除已保存的 reload hook。
- 本地 UI 中的 `Apply Preview`、`Apply Persistent`、`Clear Codex UI` 按钮：点击并确认后会调用上述能力。

会重启 Codex Desktop 的命令：

```powershell
node src/cli.js restart-codex --port 9222
```

只有在你接受当前 Codex Desktop 被关闭并以 CDP 模式重新打开时，才运行 `restart-codex`。

CDP 调试端口能力很强。建议只在本机、可信环境中临时启用，用完后正常重启 Codex Desktop 关闭调试端口。更多说明见 [SECURITY.md](SECURITY.md)。

## 运行前提

需要 Node.js 20 或更新版本。

`status`、`apply`、`clear` 需要 Codex Desktop 已经带 CDP 端口运行，通常参数是：

```text
--remote-debugging-port=9222 --remote-allow-origins=*
```

这个独立版本包含一个小型 PowerShell + C# COM 启动器，用于 Windows Store/MSIX 版 Codex：

```powershell
node src/cli.js restart-codex --port 9222
```

当前启动器只实现了 Windows MSIX Codex。

## 使用

安装依赖不是必需的；项目没有运行时依赖。直接使用 Node.js 即可：

```powershell
node src/cli.js --help
```

生成注入脚本但不应用：

```powershell
node src/cli.js dry-run --image C:\path\to\bg.jpg --out .\tmp\inject.js
```

打开本地设置页，不自动应用任何内容：

```powershell
node src/cli.js ui --ui-port 17837 --host 127.0.0.1
```

本地设置页默认中文，并提供 `中文 / English` 切换。语言偏好只保存在浏览器 `localStorage`，不会写入主题配置。

检查是否能看到 CDP target：

```powershell
node src/cli.js status --port 9222
```

用 CDP 端口重启 Windows Store/MSIX 版 Codex：

```powershell
node src/cli.js restart-codex --port 9222
```

应用背景：

```powershell
node src/cli.js apply --image C:\path\to\bg.jpg --overlay 0.42 --panel-opacity 0.62 --blur 5
```

只应用到当前渲染器，不注册 reload 持久化：

```powershell
node src/cli.js apply --image C:\path\to\bg.jpg --no-persist
```

清除当前背景，并移除已注册的 reload hook：

```powershell
node src/cli.js clear --port 9222
```

## 主题选项

- `--overlay <0..0.9>`：图片上方的暗色遮罩，默认 `0.42`。
- `--panel-opacity <0..1>`：Codex 面板透明度，默认 `0.62`。
- `--blur <px>`：磨砂玻璃模糊程度，默认 `5`。
- `--fit <cover|contain|auto>`：背景图适配方式，默认 `cover`。
- `--position <css value>`：背景图位置，默认 `center top`。不安全的 CSS 字符会被忽略并回退到默认值。
- `--accent <#rrggbb>`：强调色，默认 `#7dd3fc`。
- `--force-large`：允许超过默认 12 MB 限制的大图片 CDP payload。

## 状态文件

持久化的 CDP 注册 identifier 存在：

```text
~/.codex-background-lite/state.json
```

本地设置页保存的图片和主题配置存在：

```text
~/.codex-background-lite/config.json
~/.codex-background-lite/images/
```

浏览器里的图片选择不会暴露原始文件路径；图片会被复制到上面的 `images` 目录后再用于 dry-run 或 apply。

## 开发

```powershell
npm run check
npm test
```

如果在 PowerShell 中遇到 `npm.ps1 cannot be loaded because running scripts is disabled`，可以使用：

```powershell
npm.cmd run check
```

## 推荐流程

1. 运行 `npm run check`。
2. 运行 `node src/cli.js ui` 打开本地设置页，选择图片并调整参数。
3. 先点击 `Save Settings` 或 `Dry Run`，这两个操作不会修改 Codex UI。
4. 只有在接受 UI 影响时，才启动或重启带 CDP 的 Codex。
5. 在本地设置页里点击 `Status` 确认 target。
6. 如果想先预览，点击 `Apply Preview`，它等价于不持久化的 apply。
7. 确认效果后，再点击 `Apply Persistent`，让背景在渲染器 reload 后继续生效。
