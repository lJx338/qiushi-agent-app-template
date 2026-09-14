# 独立 Agent 应用最佳实践 v1.4

本文是独立业务应用的可复用开发基线。它以 V6-Q1“钣金激光切割 + 折弯 + 常规表面处理报价”作为第一份实践样例，规范应用开发者、平台开发者和 AI 开发会话之间的边界。应用先完成可解释的业务闭环，再接入真实数据源、审批和生产运行时；`verify` 通过不等于生产能力已经就绪。

## 1. 先定义应用，再写代码

每个应用开工前必须有一份可以独立阅读的 PRD，至少回答以下问题：

- 谁使用应用，解决哪个业务问题，客户前台的入口是什么。
- 业务场景有哪些；每个场景是 `page`、`conversation` 还是 `workflow`，入口、路由和导航归属是什么。
- 每个动作的输入、输出、状态变化、业务副作用、权限、数据用途、审批条件、幂等键和并发版本。
- 哪些数据来自平台端口，哪些是应用私有数据，哪些是外部数据源；缺失的能力由哪个平台任务提供。
- 正常、缺输入、无权限、停用、冲突、重复提交、撤权和外部结果未知时分别显示什么。
- 不做什么：例如本应用不负责登录、租户切换、内部运营后台、数据库迁移和 DSH Web Client。

PRD 中至少写一个独立的业务算例和一个拒绝算例。只写“做一个报价 Agent”不足以启动开发。

## 2. 应用和平台的职责

应用负责业务领域表达和产品体验：业务动作、确定性计算、业务状态机、输入输出 schema、页面、场景和应用私有的适配逻辑。平台负责身份、租户和工作区作用域、安装版本、授权、幂等 receipt、持久 CAS、审批存储、撤权重检、队列和 DSH runtime。

应用不得自行实现以下内容：

- 登录、Cookie、员工身份、租户选择、权限绕过或第二套授权系统。
- 直接连接 PostgreSQL、飞书、腾讯文档或供应商 API；应用只使用已发布的数据端口。
- 自己生成 operation receipt、分布式锁、跨请求幂等或跨天审批状态。
- 复制 DSH agent loop、私自安装模型/连接器或把 DSH Web Client 当产品前台。

平台尚未提供的能力必须写成 PRD 依赖和阻塞项，不能用一个内存 mock 伪装成生产实现。开发 fixture 只能验证应用代码对端口的使用方式。

## 3. 推荐目录和模块分层

```text
app.manifest.json
src/
  domain/                 # 纯业务类型、校验、状态机、确定性计算
  app.ts                  # ActionDefinition，编排 domain 与平台端口
  host.ts                 # DSH tool/host bridge，不实现 agent loop
  client/
    index.tsx             # qiushi.ui.v1 extension
    scenarios/            # 与 manifest.scenarios 一一对应的页面/流程
  ports.ts                # 应用内部最小端口类型（不暴露数据库）
schemas/                  # 输入、输出、配置 JSON Schema
fixtures/                 # 合成数据、拒绝场景、页面状态
tests/                    # 行为测试、契约测试、边界和拒绝矩阵
presets/                  # DSH preset 片段（可选）
docs/PRD.md
docs/PERMISSIONS.md
docs/DEVELOPMENT.md
docs/FRONTEND.md
```

`src/domain` 不导入 SDK、React、Node、环境变量或网络库；它可以在没有平台的情况下用纯函数测试。 `src/app.ts` 是唯一把领域动作接到 `ActionExecution` 的地方。页面和 DSH tool 都调用同一动作，不在入口里复制计算规则。

## 4. SDK 端口的正确用法

当前 `@qiushi/app-kit` 的动作收到平台提供的 `ExecutionContext` 和 `ActionExecution`：

- `ExecutionContext` 只读，含 `tenantId`、`actorId`、`installationId`、应用版本、启用状态和已授予权限；应用不得从输入重新选择这些值。
- `ActionExecution.operationId` 是平台确定的业务操作标识。写动作通过 `BusinessData.create(logicalName, input, operationId, signal)` 写入平台端口。
- `BusinessData.get/list/create` 只访问 manifest 声明的 logical name。端口已按租户、工作区、安装和字段权限作用域；应用不拿连接池或凭证。
- `dataSources` 是只读外部数据端口。使用前按 provider、resource、fields、purpose、binding state、授权版本和陈旧窗口接受平台决定；`forbidden`、`revoked`、`stale` 都是业务状态，不可吞掉。
- `DevelopmentExecutor` 和 `DevelopmentData` 只用于契约测试，提供进程内幂等和合成数据；不提供持久化、认证、分布式锁或 exactly-once。

数据字段、用途、读写操作和 `accessMode` 必须同时出现在 manifest、PRD、权限规格和测试 fixture 中。应用不为了“先跑起来”引入第二套 `getCustomer/createDraft` 私有 API；统一使用有类型的通用端口。

## 5. manifest、能力和场景

应用 manifest v2 必须至少声明一个场景。 `scenarios`、UI pages 和实际路由一一对应：

| manifest 场景 | 页面职责 | 常见用途 |
|---|---|---|
| `page` | 表单、列表、结果和历史记录 | 客户业务工作台 |
| `conversation` | 会话入口和上下文动作 | 询价、分析、助手入口 |
| `workflow` | 可追踪步骤、审批和结果 | 报价审批、交付流程 |

专家、技能、连接器、自动化、知识库和业务协同均为可选能力。应用可以将能力设为 `visible`、`internal` 或 `admin`，也可以完全不声明；客户入口不应因为内部能力而出现无意义的菜单。能力依赖必须使用官方 registry 的固定版本和摘要，`capabilityLock` 必须覆盖直接依赖及解析后的闭包。不要自行修改锁文件来放宽可见性、用途或版本。

## 6. 业务动作和状态机

一个业务动作的最低实现步骤是：校验输入 → 读取授权数据 → 应用纯领域规则 → 写入平台端口 → 返回可验证结果。副作用动作必须声明 `effects: business-write`，由平台要求幂等键；应用只消费 operationId 和结果 receipt。

状态机必须存在于生产代码的 domain 模块，不得只在测试中写一个 transitions 对象。每个状态列出允许动作、进入条件、输出和失败码；非法跃迁必须被真实调用拒绝。测试应调用动作或 domain 函数，而不是 `assert.throws(() => { throw ... })` 这种自证式断言。

推荐的业务记录字段：`id`、`tenantId`（由平台作用域提供，不由用户输入）、`status`、`version`、`createdAt`、`updatedAt`、`snapshotDigest`。版本更新使用期望版本 CAS；重复请求使用相同幂等键和相同规范化 payload，payload 改变必须返回冲突。

## 7. 报价应用的实践样例

V6-Q1 以钣金件报价为第一份标准化行业样例，业务闭环定义为：

1. 新建报价草稿，录入材料、厚度、长度、宽度、数量、工艺和币种。
2. 输入不完整时进入 `needs_input`，返回字段级错误，不进行计价。
3. 输入完整后进入 `ready_for_calculation`，读取已发布费率集和版本。
4. 按确定性规则计算材料、激光、折弯、表面处理和小计；金额使用整数最小货币单位，展示时再格式化。
5. 保存不可变报价快照和规范化 SHA-256 摘要，进入 `calculated`。
6. 需要审批时创建审批意图；申请人和审批人必须分离，审批绑定报价版本。
7. 历史记录页面只读取当前租户可见的报价，不把记录列表当成静态 fixture。

费率集必须带 `rateSetId`、版本、币种、状态和生效时间。缺失、未发布、币种不匹配或版本漂移必须返回明确的 `RATE_SET_UNAVAILABLE` 类业务错误。规范化摘要对对象键排序后再计算，测试同时证明键顺序不影响摘要、业务值变化会改变摘要。

报价应用的页面/场景最小集合为：`quote-draft`（表单页）、`quote-assistant`（会话入口）、`quote-records`（历史记录页）。每个页面都必须覆盖 loading、empty、validation、forbidden、conflict 和 failure 状态；不能只展示成功卡片。

## 8. 测试矩阵

应用交付至少包含以下行为测试，测试必须调用真实动作、领域服务或端口适配器：

| 类别 | 必测行为 |
|---|---|
| 正常 | 最小有效输入、边界金额、完整输出 schema |
| 输入 | 缺字段、非法单位、超范围、未知枚举、额外字段 |
| 状态 | 非法跃迁、重复确认、已计算版本再次修改 |
| 幂等/CAS | 相同键重放返回同一结果；相同键不同 payload 冲突；过期 version 拒绝 |
| 权限 | 未安装、停用、缺 action、撤权、跨租户、跨应用均拒绝 |
| 数据源 | provider/binding 不匹配、purpose 不匹配、字段越权、撤权、陈旧超窗 |
| 审批 | 自批拒绝、版本漂移拒绝、重复决定幂等、撤权后恢复拒绝 |
| UI | 页面/场景路由、loading/empty/error/forbidden/conflict、深链刷新 |

开发模拟和真实集成必须分开标注。合成 `DevelopmentExecutor` 通过只能证明应用遵守 SDK 契约；真实 PostgreSQL、OIDC、外部数据源、生产对象存储和 DSH 部署必须由平台验收任务提供证据。

## 9. AI 开发会话的任务包

给 AI 开发会话的任务不能只有一句功能描述。任务卡必须带：

1. 应用仓库、分支、基线 SHA 和允许修改路径。
2. 本文、应用 PRD、权限规格、前端规范和 SDK 版本。
3. 业务实体、状态机、动作/schema、页面状态和至少两个验收算例。
4. 平台已提供的端口、尚未提供的依赖和禁止自建的内容。
5. 真实测试命令、交付 evidence 路径、handoff 格式和明确的非目标。

开发会话开始时先复述上述边界；发现公共契约缺口先反馈，不复制一份 SDK 或擅自改主项目。交付必须包含完整 SHA、变更文件、真实执行命令、未验证环境、限制和开发包摘要。主控只从固定 SHA、源码、测试和 evidence 验收，不以聊天中的“完成”作为事实来源。

### 应用实践反馈闭环

报价应用同时作为最佳实践的试验场。开发会话不需要直播全部过程，只在四个检查点写结构化反馈：

1. **设计确认**：开工后先回传实体、状态机、平台端口、非目标、允许路径和验收矩阵；主控确认后再实现。
2. **领域完成**：纯 domain 和 schema 完成后回传实际动作列表、状态转移表和仍缺的端口；此时发现契约缺口就停止猜测并记录。
3. **失败或决策**：命令失败、测试暴露语义冲突、需要改变公共契约或发现模板缺规则时，使用 `task:ctl feedback`，带命令、最短错误、已尝试方案、最小提案和影响。可修复的普通编译错误继续当前回合，不用每次失败都打断主控。
4. **交付**：只用 `handoff` 交付固定完整 SHA；evidence、artifact digest 和验证命令必须与该 SHA 同一提交。

主控按这些反馈更新三类资产：

- 只影响当前业务的规则，写回应用 PRD/任务卡；
- 会影响多个应用的端口或验收，更新平台契约和模板；
- 重复出现的 AI 误解，更新本文件、模板 AGENTS 和任务提示。

反馈记录要保留“观察 → 复现 → 规则变化 → 验证”的链条。不要因为一次偶发命令失败就增加门禁；只有能稳定复现、会导致错误交付或跨应用重复的问题才升级为模板规则。最佳实践版本随规则变化递增，报价应用 evidence 记录采用了哪一版。

### Q1 实践记录（v1）

- **观察**：在开发模拟器中用固定 `operationId` 作为默认幂等键，会让不同测试用例互相复用结果；开发者随后尝试用脚本批量替换实现，暴露出修改顺序和中间状态不可见的问题。
- **复现**：同一进程连续执行两个没有显式幂等键的写动作，第二个请求命中前一个 receipt；改动后必须重新运行完整验证确认显式键冲突和普通调用隔离。
- **规则变化**：应用测试只有显式提供幂等键时才断言跨请求重放/冲突；默认调用由执行器生成独立测试意图。幂等语义必须在任务卡、端口适配器和行为测试中同时写明。领域拆分采用小步提交和每步 typecheck，禁止用不可审查的大段字符串替换作为唯一实现方式。
- **验证**：Q1 开发会话在最终 handoff 前必须提供显式键重放、显式键 payload 冲突和默认调用隔离三组行为证据；该记录只适用于开发模拟器，不能替代平台生产 receipt。

### Q1 实践记录（v1.2）

- **观察**：应用测试直接调用 action 可以在 `verify` 中通过，但会绕过 input/output schema、权限、启用状态和 `DevelopmentExecutor` 的结果校验；同时 handoff 后仍出现 evidence 工作树修改。
- **复现**：用 executor 执行报价动作时，输入中使用了实现需要但 schema 未声明的字段会先被拒绝；计算结果包含 schema 未声明的字段会被包装成 `EXTERNAL_RESULT_UNKNOWN`。固定 SHA handoff 后 `git status` 仍显示 evidence 修改，说明交付事实不稳定。
- **规则变化**：每个应用至少有一条真实 `DevelopmentExecutor.execute` 路径，测试输入和输出必须由同一 schema 校验；直接 action 测试只能补充领域单元测试，不能作为唯一验收。handoff 前必须在最终提交上运行 `git status --short` 并证明 clean；handoff 后开发会话停止写入，任何新改动必须生成新的 head 和新的 handoff。
- **验证**：Q1 返工必须补 executor 的成功、无权、停用、幂等重放/冲突、输出 schema 失败路径，并在 evidence 中记录固定 head 与 clean 工作树。

### Q1 实践记录（v1.3）

- **观察**：交付实现用 canonical JSON 的前缀拼接业务 ID，产生了包含 `{`、逗号等内容的非不透明标识；manifest 也可以声明 records 页面和读取权限，却没有对应的读取 action 或 `BusinessData.list` 消费。
- **规则变化**：业务 ID 必须来自平台 operationId、合法 UUID 或摘要的十六进制编码，不能直接截取 JSON 文本；输出 schema 应对 ID 格式做约束。每一个 manifest page/scenario 必须有真实 action、data port 或明确的只读产品来源，页面不得用空数组冒充已实现能力。
- **验证**：测试增加 ID 格式、页面动作映射和 data port 实际调用断言；
  `app:check`/verify 通过只作为静态门禁，主控仍需从固定 SHA 运行一次 executor 和页面消费路径。

### Q1 实践记录（v1.4）

- **观察**：审批动作把 `applicantActorId` 和 `approverActorId` 当作普通输入读取；records 页面虽然声明了数据依赖，却仍从应用进程内 Map 读取，声明与实际授权边界不一致。
- **规则变化**：身份只能来自平台提供的 `ExecutionContext.actorId`，输入中的身份字段不得覆盖或代替可信上下文。需要授权的数据必须经过 `BusinessData` 或应用私有的受限适配器，不能因为 manifest 已声明 logical name 就把本地 Map 称为持久化记录。写动作的每个操作都要验证显式幂等键和 payload 冲突。
- **验证**：行为测试必须证明换 actor 不能冒充审批人，records 会调用受限端口并拒绝跨租户/工作区读取；最终 handoff 的完整 SHA、evidence 和 clean 工作树必须一致。

## 10. 发布前检查

```sh
npm ci
npm run app:check
npm run app:test
npm run typecheck
npm run verify
npm run app:pack
git diff --check
```

交付前检查 manifest/package/实现/schema/fixture/test/docs 是否同步，确认没有密钥、客户数据、`dist`、`node_modules`、`.local` 或无关平台文件。开发包的 `stage=development`、未签名和 `productionReady=false` 必须保留；后台登记、测试租户开通、真实授权和生产启用是后续平台发布流程。
