import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z
      .string()
      .default('3000')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive()),

    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    IS_DEMO_MODE: z
      .string()
      .optional()
      .transform((val) => val === 'true'),

    DATABASE_URL: z.string().optional(),
    PRODUCTION_DATABASE_URL: z.string().optional(),
    DEMO_DATABASE_URL: z.string().optional(),

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
  })
  .refine(
    (data) => Boolean(data.PRODUCTION_DATABASE_URL || data.DATABASE_URL),
    {
      message: 'Either PRODUCTION_DATABASE_URL or DATABASE_URL must be provided in environment variables.',
      path: ['PRODUCTION_DATABASE_URL'],
    }
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production' && !data.IS_DEMO_MODE) {
        return (
          data.JWT_ACCESS_SECRET !== 'default-ebms-access-secret-key-change-in-production' &&
          data.JWT_REFRESH_SECRET !== 'default-ebms-refresh-secret-key-change-in-production'
        );
      }
      return true;
    },
    {
      message: 'In production mode, custom JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set via environment variables.',
      path: ['JWT_ACCESS_SECRET'],
    }
  );

export type Env = z.infer<typeof envSchema>;
