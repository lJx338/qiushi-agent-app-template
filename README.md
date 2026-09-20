# starter-app · 独立 Agent 应用

负责人：lJx338。已由生成器创建的独立应用，固定开发包位于 vendor，安装无需平台源码或平台仓库权限。当前为 development，默认动作是为合成客户创建业务草稿。

**先打开 [中文 HTML 开发教程](docs/tutorial.html)**：下载到本地后双击即可阅读，包含完整命令、给 AI 的任务示例与交付检查，无外部网络依赖。随后按 [平台接入指南](docs/PLATFORM-INTEGRATION.md)、[本地模拟与真实环境对照](docs/LOCAL-AND-REAL-ENVIRONMENTS.md)、[提交失败排错](docs/SUBMISSION-TROUBLESHOOTING.md) 和 [权限、数据源与场景示例](docs/PERMISSION-DATA-SOURCE-SCENARIO-EXAMPLES.md) 继续。

开始实现前先按 [应用最佳实践](docs/APPLICATION-BEST-PRACTICES.md) 完成 `docs/PRD.md`、状态机、权限规格和验收矩阵；应用只实现业务领域，身份、租户、幂等、CAS 和持久审批由平台端口提供。

## 首次运行

使用 .nvmrc 的 Node 版本（nvm 用户可运行 nvm install 和 nvm use），执行：

当前验收环境为 macOS/Linux；Windows 可采用 WSL2，原生 Windows 尚未验收。

```sh
npm ci
npm run verify
npm run app:run
npm run app:dev
```

生成器会同时写入与 vendor 归档一致的 package-lock.json；首次进入目录即可运行 npm ci。app:dev 输出本机随机端口地址，Ctrl+C 退出；数据重启清空。

此仓库可直接作为样板验证。创建你自己的应用时，使用固定包内生成器输出到新的独立目录，再只打开新目录给 AI：

```sh
npm run app:create -- crm-assistant --name "客户管理 Agent" --owner YOUR_GITHUB_LOGIN --out ../crm-assistant
cd ../crm-assistant
npm ci
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

应用可在 `app.manifest.json` 的 `dependencies` 中声明平台官方能力，并提交同一份 `capabilityLock`。锁定条目包含版本、摘要、权限、数据用途、直接声明的 required 和 requestedPurposes；`app:check` 会从官方目录解析完整传递依赖闭包，能力撤回、运行时不兼容、摘要变化、循环依赖或用途扩张都会拒绝。

`scenarios` 声明客户可进入的页面、会话和流程入口。每个场景声明 `entry`、`route`、`title`、`navigation`、数据用途和业务域；能力引用为空是合法的，`visible`、`internal`、`admin` 分别表示客户可见、场景内部和运营专用暴露。应用不需要创建专家、技能、连接器、自动化或知识库菜单。

产物在 .local/artifacts：应用 tgz 与 v2 release.json，含归档、UI、runtime 的 SHA-256、数据依赖、权限摘要和开发阶段标记。应用源码在本仓库评审；后续后台按制品登记、校验、授权和启用，不要求合并到平台源码。

后台尚未实现；此开发包未签名、不能生产启用，也未验证真实 Edge loader/隔离、登录/权限、飞书或持久业务。`npm run app:check -- --release` 必须拒绝生产发布。

## 文件与规范

- src/app.ts / src/host.ts：业务定义 / DSH 工具桥接。
- schemas / fixtures / tests：契约、合成数据、业务测试。
- docs：本应用 PRD、权限、开发与前端规范。
- vendor：固定版本的 npm 开发包（允许提交的依赖归档），不是应用构建产物；npm lock 含完整性校验。
- AGENTS.md：AI 开发入口；.github/workflows/quality.yml：本仓库检查和开发打包。

工具依赖统一为 @qiushi/app-kit；不要安装另一份 UI/模型运行框架或修改归档。版本升级由平台发布，所有应用通过依赖更新 PR 跟进。当前采用私有模板内归档分发，未发布公共 npm 包。
