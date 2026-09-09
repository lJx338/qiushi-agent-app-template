# starter-app · 独立 Agent 应用

负责人：lJx338。已由生成器创建的独立应用，固定开发包位于 vendor，安装无需平台源码或平台仓库权限。当前为 development，默认动作是为合成客户创建业务草稿。

**先打开 [中文 HTML 开发教程](docs/tutorial.html)**：下载到本地后双击即可阅读，包含完整命令、给 AI 的任务示例与交付检查，无外部网络依赖。

## 首次运行

使用 .nvmrc 的 Node 版本（nvm 用户可运行 nvm install 和 nvm use），执行：

当前验收环境为 macOS/Linux；Windows 可采用 WSL2，原生 Windows 尚未验收。

```sh
npm ci
npm run verify
npm run app:run
npm run app:dev
```

首次生成目录尚无 package-lock.json 时，先运行一次 npm install，之后提交 lock 并统一使用 npm ci。分发的 GitHub 模板已带 lock。app:dev 输出本机随机端口地址，Ctrl+C 退出；数据重启清空。

此仓库可直接作为样板验证。创建你自己的应用时，使用固定包内生成器输出到新的独立目录，再只打开新目录给 AI：

```sh
npm run app:create -- crm-assistant --name "客户管理 Agent" --owner YOUR_GITHUB_LOGIN --out ../crm-assistant
cd ../crm-assistant
npm install
npm run verify
```

每个新应用建立自己的私有 Git 仓库。生成器拒绝覆盖已有目录，不修改当前样板。不要把只修改名称当作业务完成；先按 docs/PRD.md 补齐需求和验收。

## 交付

```sh
npm run app:check
npm run app:test
npm run app:build
npm run app:pack
```

产物在 .local/artifacts：应用 tgz 与 v2 release.json，含归档、UI、runtime 的 SHA-256、数据依赖、权限摘要和开发阶段标记。应用源码在本仓库评审；后续后台按制品登记、校验、授权和启用，不要求合并到平台源码。

后台尚未实现；此开发包未签名、不能生产启用，也未验证真实 DSH Host/Client、登录/权限、飞书或持久业务。`npm run app:check -- --release` 必须拒绝生产发布。

## 文件与规范

- src/app.ts / src/host.ts：业务定义 / DSH 工具桥接。
- schemas / fixtures / tests：契约、合成数据、业务测试。
- docs：本应用 PRD、权限、开发与前端规范。
- vendor：固定版本的 npm 开发包（允许提交的依赖归档），不是应用构建产物；npm lock 含完整性校验。
- AGENTS.md：AI 开发入口；.github/workflows/quality.yml：本仓库检查和开发打包。

工具依赖统一为 @qiushi/app-kit；不要安装另一份 UI/模型运行框架或修改归档。版本升级由平台发布，所有应用通过依赖更新 PR 跟进。当前采用私有模板内归档分发，未发布公共 npm 包。
