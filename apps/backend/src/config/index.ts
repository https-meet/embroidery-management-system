import dotenv from 'dotenv';
import path from 'path';
import { envSchema, type Env } from './env.schema';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

const rawEnv = validateEnv();

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  isDemoMode: boolean;
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  corsOrigin: string;
  security: {
    bcryptSaltRounds: number;
  };
}

export const config: AppConfig = {
  port: rawEnv.PORT,
  nodeEnv: rawEnv.NODE_ENV,
  isDemoMode: rawEnv.IS_DEMO_MODE ?? false,
  databaseUrl: rawEnv.DATABASE_URL,
  jwt: {
    accessSecret: rawEnv.JWT_ACCESS_SECRET,
    refreshSecret: rawEnv.JWT_REFRESH_SECRET,
    accessExpiresIn: rawEnv.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: rawEnv.JWT_REFRESH_EXPIRES_IN,
  },
  corsOrigin: rawEnv.CORS_ORIGIN,
  security: {
    bcryptSaltRounds: rawEnv.BCRYPT_SALT_ROUNDS,
  },
};
