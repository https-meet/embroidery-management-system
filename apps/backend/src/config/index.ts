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

const resolvedProdDbUrl = rawEnv.PRODUCTION_DATABASE_URL || rawEnv.DATABASE_URL || '';
const resolvedDemoDbUrl = rawEnv.DEMO_DATABASE_URL || rawEnv.DATABASE_URL || '';
const resolvedDbUrl = rawEnv.DATABASE_URL || resolvedProdDbUrl;

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  isDemoMode: boolean;
  databaseUrl: string;
  productionDatabaseUrl: string;
  demoDatabaseUrl: string;
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
  databaseUrl: resolvedDbUrl,
  productionDatabaseUrl: resolvedProdDbUrl,
  demoDatabaseUrl: resolvedDemoDbUrl,
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
