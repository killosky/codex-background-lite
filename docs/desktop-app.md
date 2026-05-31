# Codex Background Lite 桌面应用说明

项目现在包含一个独立的 Windows 桌面应用，使用 Electron 构建。

## 日常使用流程

1. 打开 `Codex Background Lite`。
2. 选择 PNG、JPEG 或 WebP 图片。
3. 调整背景遮罩、面板透明度、模糊、适配方式、图片位置、强调色和 CDP 端口。
4. 如果状态显示没有连接 Codex，点击 `启动/重启 Codex`。
5. 点击 `应用到 Codex`。

这个应用会通过本机 CDP 端口把 CSS 注入到当前运行的 Codex 渲染器里。它不会修改 Codex 安装文件。

Codex 完全退出、Codex 更新、电脑重启后，背景可能消失。这是当前版本接受的行为。需要恢复时，重新打开应用并点击 `应用到 Codex`。

## 界面按钮说明

- `应用到 Codex`：保存当前设置，并把背景应用到当前 Codex 窗口。
- `状态检查`：检查 CDP 端口是否能找到 Codex 页面。
- `清除背景`：移除当前 Codex 窗口中的背景样式。
- `保存设置`：只保存图片和参数，不修改 Codex。
- `启动/重启 Codex`：关闭当前 Codex，并用 CDP 参数重新启动。这个操作可能中断当前对话。
- `打开配置位置`：在文件管理器中打开配置文件所在位置。

## 开发运行

```powershell
npm install
npm run desktop
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

## 当前构建产物

- 免安装目录版：`dist\win-unpacked\Codex Background Lite.exe`
- 安装包：`dist\Codex Background Lite Setup 0.1.0.exe`

## 为什么应用体积较大

桌面应用使用 Electron 构建。Electron 会把 Chromium 和 Node.js 一起带进应用目录：

- Chromium 用来渲染桌面界面。
- Node.js 用来访问本机文件、配置目录、进程启动和 CDP 通信。
- electron-builder 会额外下载 Windows 打包所需的二进制工具。

所以体积主要来自运行时和打包工具，而不是项目业务代码。当前项目的 `src/` 代码只有几十 KB，但解包后的 Electron 应用通常会超过 200 MB。

常见体积来源：

```text
dist\win-unpacked\Codex Background Lite.exe    Electron 主程序和 Chromium 运行时
dist\win-unpacked\*.dll                        GPU、Vulkan、DirectX、ffmpeg 等运行库
dist\win-unpacked\locales\                     Chromium 多语言资源
node_modules\electron\                         开发期 Electron 依赖
node_modules\app-builder-bin\                  打包工具二进制
```

保留 Electron 版的原因是它已经具备完整桌面界面、文件选择、预览、IPC、安全桥、Windows 安装包和 Codex 启动流程。对当前第一版应用来说，这比重写原生界面更稳定。

## 下载镜像说明

项目已经配置 Electron 和 electron-builder 使用镜像源下载二进制文件。原因是当前网络环境访问 GitHub 的 Electron 二进制包容易超时。
