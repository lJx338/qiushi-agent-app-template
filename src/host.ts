import type { Context } from '@deepseek-ai/cordis';
import { registerDshApp } from '@qiushi/app-kit/dsh';
import app from './app.ts';

export const name = 'qiushi-starter-app';
export const inject = ['tools', 'qsBusiness'];

export function apply(ctx: Context): void {
  registerDshApp(ctx, app);
}

/** The control service invokes the selected release contribution through this port. */
export async function executeAction(actionId: string, input: unknown, execution: Parameters<NonNullable<typeof app.actions[number]['execute']>>[1]): Promise<unknown> {
  const action = app.actions.find(item => item.id === actionId);
  if (!action) throw new Error(`Unknown application action: ${actionId}`);
  return action.execute(input as never, execution);
}
