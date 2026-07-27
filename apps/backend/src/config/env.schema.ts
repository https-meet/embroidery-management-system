import { z } from 'zod';

export const envSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16, 'JWT_ACCESS_SECRET must be at least 16 characters long')
    .default('default-ebms-access-secret-key-change-in-production'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long')
    .default('default-ebms-refresh-secret-key-change-in-production'),

  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(4).max(15)),
});

export type Env = z.infer<typeof envSchema>;
