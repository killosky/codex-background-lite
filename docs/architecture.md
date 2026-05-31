# 架构说明

`codex-background-lite` 当前以 Electron 桌面应用为唯一正式入口。应用本身不修改 Codex 安装文件，只通过本机 CDP 调试端口向当前 Codex Electron 渲染器注入 CSS。

## 模块划分

```text
src/desktop/main.js       Electron 主进程，负责 IPC、配置读写、CDP 操作和启动 Codex
src/desktop/preload.cjs   安全桥，只向渲染进程暴露必要 API
src/desktop/renderer.*    桌面应用界面、预览和用户交互
src/cdp.js                CDP HTTP target 探测、WebSocket 命令、样式注入和清除
src/config.js             配置文件、图片复制和配置合并
src/image.js              图片类型识别、大小限制和 data URI 转换
src/launcher.js           Windows Store/MSIX 版 Codex 启动逻辑
src/state.js              本机状态文件
src/theme-script.js       生成注入到 Codex 的 JavaScript 和 CSS
src/cli.js                辅助调试命令，不作为主产品入口
```

## 运行流程

1. 用户在桌面应用里选择图片和主题参数。
2. 主进程把图片复制到 `~\.codex-background-lite\images\`。
3. 配置写入 `~\.codex-background-lite\config.json`。
4. 用户点击 `应用到 Codex`。
5. 主进程通过 `src/cdp.js` 查找 Codex CDP target。
6. `src/theme-script.js` 根据图片和参数生成注入脚本。
7. CDP `Runtime.evaluate` 把样式应用到当前 Codex 窗口。

## 为什么不做永久生效

当前版本接受 Codex 重启或电脑重启后背景消失。这样可以避免：

- 修改 Codex 安装文件。
- 常驻后台进程。
- 开机自动恢复脚本。
- Codex 更新后残留状态。

用户需要时重新打开应用并点击 `应用到 Codex`。

## 体积来源

应用体积主要由 Electron 运行时决定。业务代码、主题脚本和 CDP 逻辑很小，但 Electron 需要携带 Chromium、Node.js、GPU/媒体相关 DLL、多语言资源和打包运行文件。

这意味着：

- 安装包约几十 MB 属于正常范围。
- 解包后的 Windows 应用目录达到 200 MB 级别属于 Electron 的常见结果。
- 开发目录还会额外包含 `node_modules\electron` 和 `node_modules\app-builder-bin`，因此会比最终安装目录更大。

本项目接受这个体积成本，以换取第一版应用已经完成的桌面界面、安装器、文件选择、预览、IPC 和 Codex 启动流程。

## 安全边界

- 应用只连接本机 CDP 端口。
- 图片和配置只保存在当前用户目录。
- `启动/重启 Codex` 是唯一会关闭 Codex 进程的操作，界面必须提示确认。
- 不再提供开机自动恢复入口。
