# 制品提交与失败排错 v1.0

本页适用于 `@qiushi/app-kit 0.4.0-dev.2` 的 development 制品。排错顺序是保留证据 → 缩小差异 → 修复来源 → 重新从同一提交打包；不要删 lock、关测试、修改 stage 或伪造摘要。

| 现象/错误 | 先检查 | 正确处理 | 禁止做法 |
| --- | --- | --- | --- |
| `npm ci` 失败 | Node 是否为 `.nvmrc`；`package.json` 与 lock；vendor 归档是否存在 | 已有应用定位 lock/依赖变更；新生成应用第一次用 `npm install` | 删除 lock、安装 latest、编辑 tgz |
| `app:create` 报 `EEXIST` | `--out` 是否已存在 | 换一个不存在的输出目录；保留已有目录 | 覆盖或删除已有应用 |
| `app:check` 拒绝 manifest/场景/lock | 输出的具体 field；manifest、UI 页面、schema、PRD 是否同改 | 按公开契约补齐场景、用途、闭包 lock 或页面映射 | 增加猜测字段、绕过检查、手改 lock 摘要 |
| `app:test` 或 `verify` 失败 | 最小合成输入、错误码、当前 commit | 修复领域规则/fixture/test 的真实不一致；保留拒绝用例 | 删除失败测试、把异常吞掉 |
| `app:pack` 失败 | 先跑 `app:check`；检查未构建的 UI/runtime 与输出路径 | 修复前置检查后重跑；读取 `.local/artifacts/` 的新 descriptor | 手写 release.json 或复用旧包 |
| 门户提示摘要不一致 | 同次 `app:pack` 的 `.tgz` 与 `.release.json`；SHA-256 | 重新选择同一目录中的一对文件；从同一 commit 重打包 | 修改 descriptor.sha256 或提交不同版本的配对 |
| 门户提示 app/version/能力不兼容 | 完整 40 位 commit、项目 appId、app-kit 版本、capabilityLock | 更新到平台已支持的开发包，或把能力需求写入 PRD/Workpad | 伪造 sourceCommit、降级/篡改 lock |
| 构建回执失败 | 失败分类、提交版本、descriptor 与源码提交 | 将回执和最小复现附到应用 Issue；等待平台修复其能力 | 把回执成功称为上架/启用 |
| `--release` 被拒绝 | stage、productionReady 与真实发布要求 | 保持拒绝；按平台发布流程申请真实验收 | 修改 stage 或 productionReady |

## 可复现记录模板

```text
应用/版本：qiushi.example@1.2.3
commit：<40 位 SHA>
命令：npm run app:check
预期：manifest 与场景闭包通过
实际：<最短脱敏错误>
最小合成输入或 descriptor 字段：<不含客户数据/凭证>
已尝试：<修复步骤>
影响：<阻塞的场景或交付>
需要的平台决定：<契约或能力>
```

普通可修复编译错误在当前分支自行修复并重跑。需要公共契约、真实数据源、平台环境或连续失败时，更新唯一 Linear Issue Workpad；未使用 Linear 时更新应用 PR 或 Issue。提交固定 SHA 前，确保 `git status --short` 为空，并把真正执行的命令和结果一起交付。
