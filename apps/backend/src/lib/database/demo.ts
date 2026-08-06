import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

const globalForDemoPrisma = globalThis as unknown as {
  demoPrisma: PrismaClient | undefined;
};

export const demoPrisma =
  globalForDemoPrisma.demoPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: config.demoDatabaseUrl,
      },
    },
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForDemoPrisma.demoPrisma = demoPrisma;
}
