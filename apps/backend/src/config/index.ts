/**
 * Application configuration.
 * Environment variable binding happens here.
 * All other modules import from this file — never from process.env directly.
 *
 * Full env validation (zod/dotenv) will be added in a later task.
 */
export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: (process.env['NODE_ENV'] ?? 'development') as 'development' | 'production' | 'test',
} as const;
