import { defineApp, type Customer, type Draft } from '@qiushi/app-kit';
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
      const customer = await execution.data.get<Customer>('customer', customerId, execution.signal);
      if (!customer) throw new Error('customer not found');
      const draft = await execution.data.create<Draft>('quote-draft', {
        customerId: String(customer.customerId),
        title,
        details: { customerName: String(customer.displayName) },
      }, execution.operationId, execution.signal);
      return { draftId: String(draft.id), customerId: String(customer.customerId), title: String(draft.title) };
    },
  }],
});
