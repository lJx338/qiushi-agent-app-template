import app from './app.ts';

/** Edge Runtime contribution. DSH is an explicit optional compatibility profile, not this app's default runtime. */
export const extension = { apiVersion: 'qiushi.edge-extension.v1', appId: 'qiushi.starter-app', app } as const;

/** The single ActionExecution chain invokes the selected release contribution through this port. */
export async function executeAction(actionId: string, input: unknown, execution: Parameters<NonNullable<typeof app.actions[number]['execute']>>[1]): Promise<unknown> {
  const action = app.actions.find(item => item.id === actionId);
  if (!action) throw new Error(`Unknown application action: ${actionId}`);
  return action.execute(input as never, execution);
}
