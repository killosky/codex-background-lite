# 安全说明

## 当前安全模型

`codex-background-lite` 不修改 Codex Desktop 安装文件。应用背景时，它只连接本机 CDP 端口，并向当前 Codex Electron 渲染器注入一段可移除的 CSS。

## 需要注意的操作

- `应用到 Codex`：会通过 CDP 修改当前 Codex 界面。
- `清除背景`：会通过 CDP 移除当前 Codex 界面里的背景样式。
- `状态检查`：只读取本机 CDP target 信息。
- `启动/重启 Codex`：会关闭当前 Windows Codex 进程，并用 CDP 参数重新启动，可能中断当前对话。

## CDP 风险

CDP 调试端口权限较高。建议只在本机可信环境中使用，不要把端口暴露给局域网或公网。

常用参数：

```text
--remote-debugging-port=9222 --remote-allow-origins=*
```

如果不再需要背景功能，可以正常退出 Codex，然后用普通方式重新打开 Codex，让它不带 CDP 参数运行。

## 本机数据

配置和图片保存在当前用户目录：

```text
~\.codex-background-lite\
```

工具不会上传图片或配置。

## 上报安全问题

如果发现安全问题，请优先私下联系维护者，不要直接公开发布利用细节。
