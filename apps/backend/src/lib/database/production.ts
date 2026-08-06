import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

const globalForProductionPrisma = globalThis as unknown as {
  productionPrisma: PrismaClient | undefined;
};

export const productionPrisma =
  globalForProductionPrisma.productionPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: config.productionDatabaseUrl,
      },
    },
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForProductionPrisma.productionPrisma = productionPrisma;
}
