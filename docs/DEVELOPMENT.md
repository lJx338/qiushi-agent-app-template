# 独立应用开发流程

图文步骤见 [离线 HTML 教程](tutorial.html)，双击即可打开，无需联网或启动服务。

开发工具验收环境为 macOS 和 Linux CI；Windows 建议在 WSL2 的 Linux 环境执行，原生 Windows 尚未验收。

1. 使用 .nvmrc 指定 Node，模板有 lock 时 npm ci，首次新生成应用用 npm install 生成 lock。
2. 明确本应用 PRD、权限规格和验收样例；创建短任务分支，一个 AI 会话一个独立工作区。
3. 使用 @qiushi/app-kit 定义动作；业务代码放 src/app.ts，Host 通过 @qiushi/app-kit/dsh 注册。不自建 Agent 运行循环。manifest 中每个 action 明确声明 UI/模型/导出/外发 `purposes`，打包器不会代替业务开发者猜用途。
4. 输入输出修改同步 schemas、manifest、fixtures 和 tests。类型/动作检查不等于生产授权。
5. 运行 npm run verify；运行 npm run app:dev，验证合成数据、无权限、停用和错误输入。
6. npm run app:pack 输出开发 tgz 和 release.json。源码在本应用仓库提 PR，包通过后续平台制品流程交付，不合并业务源码到平台。

src/client/index.tsx 声明 `qiushi.ui.v1` 平台 UI extension；它使用单一 React 宿主的受限 action/data/conversation bridge，不能读 cookie、DSH session/端口或凭证。工作流可先写明确状态与副作用规格，持久审批和真实来源仍必须等待相应平台契约。当前不允许“为了跑通”接生产密钥/表 ID 或重写 SDK。

依赖分发：vendor 里的 @qiushi/app-kit 是平台构建的固定版本开发依赖，包含 SDK/CLI/规范资源，不包含平台主项目。package-lock integrity 用于安装完整性检查；它不等于可信发布者签名。保持仓库私有。升级时替换平台提供的新版本归档、对应 package 声明和 lock，并跑完整验证；不得原地修改归档伪装同版本。

Git：不直接推 main；按应用任务开短分支，PR 附需求编号、变更文件、权限影响、测试结果、包摘要和未实现项。目录范围与主干保护仍依赖实际团队配置，AGENTS/CI 文件不自动给仓库配置权限。CI 只测试合成数据，不使用生产 secrets。

平台能力问题记录到本应用 PRD，由平台负责人发布新版 SDK/工具或 provider。不要在 AI 工作区中额外克隆平台仓库。
