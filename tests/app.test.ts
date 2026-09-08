import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.ts';
import input from '../fixtures/input.json' with { type: 'json' };
import { DevelopmentExecutor } from '@qiushi/app-kit';
import { DevelopmentData, developmentContext } from '@qiushi/app-kit/development';

test('starter-app: validates a draft and deduplicates concurrent delivery', async () => {
  const data = new DevelopmentData();
  const executor = new DevelopmentExecutor(data.forExecution);
  const context = developmentContext(app.id, app.version);
  const invoke = () => executor.execute(app, app.actions[0].id, input, context, { idempotencyKey: 'logical-operation-1' });
  const [a, b] = await Promise.all([invoke(), invoke()]);
  assert.deepEqual(a, b);
  assert.equal(data.countDrafts('tenant-a'), 1);
});

test('starter-app: refuses a caller without permissions', async () => {
  const executor = new DevelopmentExecutor(new DevelopmentData().forExecution);
  await assert.rejects(executor.execute(app, app.actions[0].id, input,
    developmentContext(app.id, app.version, 'no-permission'), { idempotencyKey: 'denied' }),
    { code: 'FORBIDDEN' });
});

test('starter-app: refuses unknown input fields', async () => {
  const executor = new DevelopmentExecutor(new DevelopmentData().forExecution);
  await assert.rejects(executor.execute(app, app.actions[0].id, { ...input, tenantId: 'tenant-b' },
    developmentContext(app.id, app.version), { idempotencyKey: 'spoofed' }), { code: 'VALIDATION_FAILED' });
});
