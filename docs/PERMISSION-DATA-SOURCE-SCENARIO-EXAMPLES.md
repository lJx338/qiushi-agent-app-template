# 权限、数据源与场景示例 v1.0

示例用于填写 PRD、`PERMISSIONS.md` 和 manifest；名称、权限 ID 与 logicalName 需替换成实际已发布契约。示例不是未发布接口的实现许可。

## 示例：客户跟进草稿

| 项目 | 声明 |
| --- | --- |
| 客户场景 | `customer-follow-up`；kind `page`；route `follow-ups`；navigation `customer`；用途 `ui` |
| 动作 | `qiushi.crm.create-follow-up`；`effects: business-write`；权限 `crm:follow-up:create`；用途 `ui` |
| 输入/输出 | 输入含 customer reference、主题、摘要；不接受 `tenantId`、`actorId`、owner 或审批人。输出仅含草稿 ID、状态、版本和允许显示的摘要 |
| 数据 | `BusinessData.get('customer', ...)` 只读取 manifest 声明的客户名称/公开联系方式；`BusinessData.create('follow-up', ..., operationId)` 写入平台端口 |
| 拒绝 | 安装未授权、员工缺动作权限、客户不在范围、字段无权、停用或撤权均拒绝且不泄露记录存在性 |
| 幂等 | 同一可信 operationId + 同一规范化 payload 重放同一结果；payload 不同返回冲突 |

`tenantId`、`actorId`、`installationId`、`operationId` 来自平台 `ExecutionContext`/`ActionExecution`，不能由表单、模型、URL 或浏览器存储提供。读取客户不自动允许模型、导出或外发；新增用途要同步 manifest、权限规格、用户授权和测试。

## 示例：只读外部订单查询

| 项目 | 声明 |
| --- | --- |
| 场景 | `order-lookup`；kind `page` 或 `conversation`；用户可见结果声明 `ui` 用途 |
| 数据源 | 发布的 read-only provider + 受批准 binding；只请求订单号、状态、承诺日期等最小字段 |
| 授权模式 | `tenant-shared` 仅表示企业批准的数据集；`user-delegated` 必须有平台登记的源用户委托，不能按姓名猜测或继承平台角色 |
| 结果状态 | `forbidden`、`revoked`、`stale`、`rate-limited`、`unavailable` 分别显示可行动但不泄密的状态 |
| 撤权 | 每次读取检查 binding、用途、字段和授权版本；拒权/撤权使缓存失效，不回放旧成功正文 |

应用不接收 token、数据库地址、任意表名或供应商 URL；不能在源端拒绝时改用更高权限机器人。需要模型总结时，单独声明 `model` 用途并按字段规则再次授权。

## 示例：审批工作流与内部能力

`quote-approval` 可以是 `workflow` 场景：申请人提交指定报价版本，平台从可信上下文取得申请人；审批人来自平台分配，不从输入传入。自批、版本漂移、撤权后恢复和同键不同 payload 都应拒绝。应用记录业务意图和状态，不自建跨天队列、审批表或第二套员工身份。

能力可被场景标为 `visible`、`internal` 或 `admin`：

- `visible` 仅表示客户导航可消费，仍受安装和员工权限限制；
- `internal` 用于场景内部的技能/连接器，不自动出现在菜单；
- `admin` 只能保留运营可见性，不能降级为客户入口或用客户身份读取数据。

所有场景、UI pages 与能力 lock 必须闭合。场景能力为空合法；不要为了显示菜单虚构专家、连接器或数据记录。

## 最小验收表

| 类别 | 合成开发验证 | 真实集成验证 |
| --- | --- | --- |
| 客户草稿 | 成功、无权限、停用、跨租户、重放/冲突 | 平台提供真实客户会话、安装/字段/用途与审计证据后执行 |
| 外部订单 | provider/binding/purpose/字段/撤权/陈旧的合成分支 | 真实源身份、批准 binding、403/429、撤权缓存失效 |
| 审批 | 自批、版本漂移、重复决定、撤权恢复拒绝 | 持久审批、恢复、审计和操作回执 |

开发模拟通过只能填“开发模拟”；真实环境尚未提供时填“未实现/等待平台”，并在 PRD/Workpad 写明申请路径。
