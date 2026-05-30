# codex-background-lite

`codex-background-lite` 是一个独立的 Windows 桌面应用，用来给 Codex Desktop 应用自定义背景图。它不修改 Codex 安装文件，只通过本机 Chrome DevTools Protocol（CDP）端口向当前 Codex Electron 渲染器注入 CSS。

当前项目已经移除第一版网页恢复和开机自动恢复流程，正式入口只保留桌面应用。

## 适用场景

- 想给 Codex Desktop 设置背景图。
- 能接受 Codex 重启或电脑重启后背景消失。
- 希望每次需要时打开本应用，点击一次 `应用到 Codex`。

## 快速使用

安装包：

```text
dist\Codex Background Lite Setup 0.1.0.exe
```

免安装版本：

```text
dist\win-unpacked\Codex Background Lite.exe
```

使用流程：

1. 打开 `Codex Background Lite`。
2. 选择 PNG、JPEG 或 WebP 图片。
3. 调整背景遮罩、面板透明度、模糊、适配方式、图片位置、强调色和 CDP 端口。
4. 如果状态显示没有连接 Codex，点击 `启动/重启 Codex`。
5. 点击 `应用到 Codex`。

Codex 完全退出、更新、电脑重启后，背景可能消失。重新打开应用，再点击一次 `应用到 Codex` 即可。

## 功能

- 选择并保存背景图片。
- 调整遮罩、透明度、模糊、适配方式、图片位置和强调色。
- 检查 Codex CDP 连接状态。
- 启动或重启 Windows Store/MSIX 版 Codex，并自动带上 CDP 参数。
- 将背景应用到当前 Codex 窗口。
- 清除当前 Codex 窗口中的背景样式。

## 项目结构

```text
src/
  desktop/          Electron 桌面应用界面和 IPC
  cdp.js            CDP 连接、页面选择、样式注入和清除
  config.js         本机配置和图片保存
  image.js          图片校验和 data URI 转换
  launcher.js       Windows MSIX Codex 启动器
  state.js          本机状态文件
  theme-script.js   生成注入到 Codex 的 CSS/JS
  cli.js            辅助调试命令
test/               Node 测试
docs/               中文说明文档
```

更多架构说明见 [docs/architecture.md](docs/architecture.md)。

## 开发

需要 Node.js 20 或更新版本。

安装依赖：

```powershell
npm install
```

启动开发版桌面应用：

```powershell
npm run desktop
```

运行检查：

```powershell
npm run check
```

如果 PowerShell 提示 `npm.ps1 cannot be loaded because running scripts is disabled`，使用：

```powershell
npm.cmd run check
```

## 打包

生成免安装目录版：

```powershell
npm run pack:win
```

生成 Windows 安装包：

```powershell
npm run dist:win
```

## 辅助命令

桌面应用是正式入口。CLI 只作为开发和排查问题时的辅助工具。

```powershell
node src\cli.js --help
node src\cli.js status --port 9222
node src\cli.js restart-codex --port 9222
node src\cli.js clear --port 9222
```

## 本机配置位置

```text
~\.codex-background-lite\config.json
~\.codex-background-lite\images\
~\.codex-background-lite\state.json
```

## 安全说明

本工具依赖 CDP 调试端口。CDP 权限较高，只建议在本机可信环境中使用。详情见 [SECURITY.md](SECURITY.md)。

## 许可证

MIT License。详见 [LICENSE](LICENSE)。

## 致谢

项目思路来自 [cmochance/codex-app-transfer](https://github.com/cmochance/codex-app-transfer) 中对 Codex Desktop 背景主题的探索。
