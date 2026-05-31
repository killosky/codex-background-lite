# 贡献指南

English version: [CONTRIBUTING.en.md](CONTRIBUTING.en.md)

感谢你考虑参与 `codex-background-lite`。

## 项目边界

当前项目只做一件事：通过独立 Windows 桌面应用，把背景图应用到 Codex Desktop。

请不要在本项目里加入这些方向：

- provider 管理
- 账号切换
- 代理配置
- Codex 更新器
- 自动开机恢复背景
- 修改 Codex 安装文件

## 开发命令

```powershell
npm install
npm run desktop
npm run check
```

打包：

```powershell
npm run pack:win
npm run dist:win
```

## 提交要求

- 用户可见文档默认使用中文。
- 修改 CDP、进程启动、配置保存逻辑时，请同步更新文档。
- 影响主题脚本生成逻辑时，请补充或更新测试。
- 不要提交 `node_modules/`、`dist/`、`.tmp/` 等生成产物。
- 如果改动会中断当前 Codex 进程，界面上必须明确提示用户确认。
