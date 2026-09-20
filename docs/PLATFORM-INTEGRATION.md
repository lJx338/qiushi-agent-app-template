# 平台接入指南 v1.0

适用开发基线：`@qiushi/app-kit 0.4.0-dev.2`、Node `22.23.2`、manifest v3、`qiushi.ui.v1`、`qiushi.app-release.v3` 与 Edge runtime extension。本文只描述独立应用开发和 development 制品交付；不授予生产访问权。

## 1. 从空目录完成首跑

先在模板根目录使用锁定依赖验证样板，再用已安装的生成器创建一个不存在的新目录。不要在平台仓库、已有应用目录或 `vendor` 内开发。

```sh
nvm install
nvm use
npm ci
npm run verify
npm run app:create -- crm-assistant --name "客户管理 Agent" --owner YOUR_GITHUB_LOGIN --out ../crm-assistant
cd ../crm-assistant
npm install
npm run verify
npm run app:pack
```

模板本身和已有应用有 `package-lock.json` 时使用 `npm ci`；新生成目录第一次使用 `npm install` 写入自己的 lock，之后 CI 与团队成员使用 `npm ci`。macOS/Linux 是当前验收环境；Windows 请通过 WSL2，原生 Windows 尚无验收结论。

`app:create` 拒绝覆盖目标目录。它不会创建远端仓库、帐号、安装、数据绑定或生产发布；进入新目录后才建立该应用自己的私有 Git 仓库和短分支。

## 2. 开发、检查和交付

在新应用根目录执行的命令均不传 slug：

| 命令 | 可证明的内容 | 不证明的内容 |
| --- | --- | --- |
| `npm run app:check` | manifest、场景、锁、导入和基础契约一致 | 员工/字段/源端权限已真实生效 |
| `npm run app:test` | 行为测试、合成拒绝与业务算例 | 外部系统或持久审批真实可用 |
| `npm run app:run` | 合成动作执行 | 客户会话、租户隔离或生产幂等 |
| `npm run app:dev` | 本机受 token/Origin 保护的开发预览 | 正式客户 UI、Edge loader/隔离或长任务恢复 |
| `npm run verify` | 开发包规定的本地门禁 | 生产发布批准 |
| `npm run app:pack` | `.local/artifacts/` 中的 development `.tgz` 与 `.release.json` | 签名、上架、客户开通或部署 |

提交前运行 `git status --short`、`git diff --check`、`npm run verify` 和 `npm run app:pack`。`.local`、`dist`、`node_modules`、真实客户数据、密钥和环境文件不提交；`vendor` 中固定开发归档是允许提交的依赖，不是可自行编辑的源码。

## 3. 用门户提交制品元数据

开发者门户只接受 developer session 可访问项目的元数据。选择 `app:pack` 生成的 `.tgz` 和相配套的 `.release.json`；浏览器计算原始字节 SHA-256，服务端校验 descriptor、应用 ID、版本、能力 lock 和当前支持的 app-kit。门户不上传或执行应用源码/归档字节。

提交时提供应用源仓库标识和**完整 40 位 commit SHA**。descriptor 的归档摘要必须与所选 `.tgz` 一致；相同 app/version 的不同摘要会被拒绝。构建回执是开发交付状态，不是生产签名或客户安装记录。

## 4. 真实平台流程仍需平台完成

目标流程是：受信构建/制品登记 → 兼容性和来源校验 → 测试租户验收 → 上架 → 企业绑定数据与授予员工权限 → 启用。当前 development 包固定 `stage=development` 与 `productionReady=false`；`npm run app:check -- --release` 应当失败。不得改 stage、descriptor 或 lock 让它“发布”。

真实登录、安装、字段/用途授权、外部数据源、持久审批、Edge loader/隔离、签名和客户开通没有因为本地命令成功而完成。对照 [本地模拟与真实环境](LOCAL-AND-REAL-ENVIRONMENTS.md)，并将缺口写入 PRD/Workpad。

## 5. 缺能力时如何申请支持

先继续实现不依赖该能力的领域逻辑。然后在本应用 PRD 和唯一 Linear Issue Workpad（不用 Linear 时写应用 PR 或 Issue）留下：

1. 业务场景、使用者与不可实现的用户结果；
2. 最小输入/输出、动作权限、记录/字段范围与 `ui`/`model`/`export`/`external-send` 用途；
3. 所需数据源模式、授权/撤权和失败体验；
4. 合成复现、已尝试方案、不能接受的临时绕过与影响范围。

不要新增猜测的 SDK API、manifest 字段、直连数据库/供应商、服务帐号、平台源码副本或开发期凭证。
