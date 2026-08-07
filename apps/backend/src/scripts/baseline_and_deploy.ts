import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

/**
 * Official Prisma Baselining Procedure for Existing Databases (P3005 resolution)
 * Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
 */
async function main() {
  console.log('=== STARTING PRISMA OFFICIAL BASELINE PROCEDURE ===\n');

  const schemaPath = 'apps/backend/prisma/schema.prisma';
  const dbUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

  try {
    // Check if _prisma_migrations table exists
    const migrationsTableExists: any[] = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `);

    const hasMigrationsTable = migrationsTableExists[0]?.exists === true;

    if (!hasMigrationsTable) {
      console.log('⚠️  _prisma_migrations table not found in target database.');
      console.log('🔄 Executing Prisma Official Baselining (P3005 Resolution)...');

      const initialMigrations = [
        '20260727000000_init_users',
        '20260727000001_add_customers',
        '20260727000002_add_designs',
        '20260727000003_add_jobs',
        '20260727000004_add_invoices_and_payments',
        '20260803000000_add_document_counters',
        '20260803000001_add_user_management_fields',
        '20260804000000_add_sessions_model',
        '20260804010000_add_materials_model',
        '20260804020000_add_suppliers_model',
        '20260804030000_add_purchases_model',
      ];

      for (const migrationName of initialMigrations) {
        console.log(`- Resolving baseline migration: ${migrationName}`);
        try {
          execSync(`npx prisma migrate resolve --applied ${migrationName} --schema=${schemaPath}`, {
            stdio: 'inherit',
            env: process.env,
          });
        } catch {
          // Ignore error if already resolved
        }
      }
      console.log('✅ Baseline migrations marked as applied.\n');
    } else {
      console.log('✅ _prisma_migrations table exists in target database.\n');
    }
  } catch (error: any) {
    console.warn('⚠️ Baselining check encountered warning:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  // Execute standard prisma migrate deploy
  console.log('🚀 Executing standard prisma migrate deploy...');
  execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('\n======================================================');
  console.log(' MIGRATION DEPLOYMENT SUCCESSFUL 🟢');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ Baseline and deployment failed:', err);
  process.exit(1);
});
