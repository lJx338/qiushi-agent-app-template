import type { Context } from '@deepseek-ai/cordis';
import { registerDshApp } from '@qiushi/app-kit/dsh';
import app from './app.ts';

export const name = 'qiushi-starter-app';
export const inject = ['tools', 'qsBusiness'];

export function apply(ctx: Context): void {
  registerDshApp(ctx, app);
}
