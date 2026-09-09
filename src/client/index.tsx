import React from 'react';
import { ConversationPanel, DataTable, Field, PageHeader, ResultPanel, defineUiExtension, type PlatformUiBridge } from '@qiushi/app-kit/ui';

const pages = [
  { id: 'draft', title: '草稿', kind: 'form', requiredHostComponents: ['PageHeader', 'Field', 'ResultPanel', 'LoadingState', 'ErrorState', 'PermissionState'] },
  { id: 'records', title: '记录', kind: 'table', requiredHostComponents: ['PageHeader', 'DataTable', 'LoadingState', 'ErrorState', 'PermissionState'] },
  { id: 'assistant', title: '会话', kind: 'conversation', requiredHostComponents: ['PageHeader', 'ConversationPanel', 'LoadingState', 'ErrorState'] },
  { id: 'workspace', title: '工作台', kind: 'mixed', requiredHostComponents: ['PageHeader', 'Field', 'DataTable', 'ResultPanel', 'ConversationPanel', 'LoadingState', 'ErrorState', 'PermissionState'] },
] as const;

export default defineUiExtension({
  apiVersion: 'qiushi.ui.v1', appId: 'qiushi.starter-app', pages,
  render: (bridge: PlatformUiBridge) => <main className="qs-app"><PageHeader title="starter-app 工作台" description="页面由平台宿主加载；业务操作由平台重新授权。" /><div className="qs-layout"><ResultPanel title="业务草稿"><Field label="客户"><input defaultValue="customer-a" /></Field><p>在具体应用中通过受限 bridge 提交已声明的业务动作。</p></ResultPanel><ConversationPanel bridge={bridge} /></div><DataTable columns={['状态', '说明']} rows={[]} empty="暂无业务记录" /></main>,
});
