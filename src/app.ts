import { defineApp } from '@qiushi/app-kit';
import inputSchema from '../schemas/create.input.json' with { type: 'json' };
import outputSchema from '../schemas/create.output.json' with { type: 'json' };

export default defineApp({
  id: 'qiushi.starter-app',
  version: '0.1.0',
  actions: [{
    id: 'qiushi.starter-app.createDraft',
    toolName: 'qiushi_starter_app_create_draft',
    description: '为有权访问的客户创建一份业务草稿。',
    permissions: ['customer:read', 'draft:create'],
    effects: 'business-write',
    inputSchema,
    outputSchema,
    async execute(input, execution) {
      const { customerId, title } = input as { customerId: string; title: string };
      const customer = await execution.data.getCustomer(customerId, execution.signal);
      const draft = await execution.data.createDraft({
        customerId: customer.id,
        title,
        details: { customerName: customer.name },
      }, execution.operationId, execution.signal);
      return { draftId: draft.id, customerId: customer.id, title: draft.title };
    },
  }],
});
