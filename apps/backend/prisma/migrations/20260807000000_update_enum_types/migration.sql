-- 1. Update InvoiceStatus Enum cleanly
UPDATE "invoices" SET "status" = 'VOID' WHERE "status"::text = 'CANCELLED';
ALTER TABLE "invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID', 'OVERDUE');
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "InvoiceStatus" USING ("status"::text::"InvoiceStatus");
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "InvoiceStatus_old";

-- 2. Update JobItemProductionStatus Enum cleanly
UPDATE "job_items" SET "production_status" = 'EMBROIDERING' WHERE "production_status"::text = 'IN_PRODUCTION';
UPDATE "job_items" SET "production_status" = 'PASSED_QC' WHERE "production_status"::text = 'COMPLETED';
UPDATE "job_items" SET "production_status" = 'DRAFT' WHERE "production_status"::text IN ('PENDING_PRODUCTION', 'CANCELLED');
ALTER TABLE "job_items" ALTER COLUMN "production_status" DROP DEFAULT;
ALTER TYPE "JobItemProductionStatus" RENAME TO "JobItemProductionStatus_old";
CREATE TYPE "JobItemProductionStatus" AS ENUM ('DRAFT', 'QUEUED', 'EMBROIDERING', 'CLEANING', 'PASSED_QC', 'REJECTED_QC', 'REWORK');
ALTER TABLE "job_items" ALTER COLUMN "production_status" TYPE "JobItemProductionStatus" USING ("production_status"::text::"JobItemProductionStatus");
ALTER TABLE "job_items" ALTER COLUMN "production_status" SET DEFAULT 'DRAFT';
DROP TYPE "JobItemProductionStatus_old";

-- 3. Update PaymentStatus Enum cleanly
UPDATE "payments" SET "status" = 'RECORDED' WHERE "status"::text = 'CONFIRMED';
UPDATE "payments" SET "status" = 'VOID' WHERE "status"::text = 'CANCELLED';
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED', 'VOID', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus" USING ("status"::text::"PaymentStatus");
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "PaymentStatus_old";
