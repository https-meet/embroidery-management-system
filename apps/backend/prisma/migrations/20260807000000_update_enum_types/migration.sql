-- 1. Update InvoiceStatus Enum cleanly
ALTER TABLE "invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID', 'OVERDUE');
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "InvoiceStatus" USING (
  CASE 
    WHEN "status"::text = 'CANCELLED' THEN 'VOID'::"InvoiceStatus"
    ELSE "status"::text::"InvoiceStatus"
  END
);
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "InvoiceStatus_old";

-- 2. Update JobItemProductionStatus Enum cleanly
ALTER TABLE "job_items" ALTER COLUMN "production_status" DROP DEFAULT;
ALTER TYPE "JobItemProductionStatus" RENAME TO "JobItemProductionStatus_old";
CREATE TYPE "JobItemProductionStatus" AS ENUM ('DRAFT', 'QUEUED', 'EMBROIDERING', 'CLEANING', 'PASSED_QC', 'REJECTED_QC', 'REWORK');
ALTER TABLE "job_items" ALTER COLUMN "production_status" TYPE "JobItemProductionStatus" USING (
  CASE 
    WHEN "production_status"::text = 'IN_PRODUCTION' THEN 'EMBROIDERING'::"JobItemProductionStatus"
    WHEN "production_status"::text = 'COMPLETED' THEN 'PASSED_QC'::"JobItemProductionStatus"
    WHEN "production_status"::text IN ('PENDING_PRODUCTION', 'CANCELLED') THEN 'DRAFT'::"JobItemProductionStatus"
    ELSE "production_status"::text::"JobItemProductionStatus"
  END
);
ALTER TABLE "job_items" ALTER COLUMN "production_status" SET DEFAULT 'DRAFT';
DROP TYPE "JobItemProductionStatus_old";

-- 3. Update PaymentStatus Enum cleanly
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'RECORDED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED', 'VOID', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus" USING (
  CASE 
    WHEN "status"::text = 'CONFIRMED' THEN 'RECORDED'::"PaymentStatus"
    WHEN "status"::text = 'CANCELLED' THEN 'VOID'::"PaymentStatus"
    ELSE "status"::text::"PaymentStatus"
  END
);
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "PaymentStatus_old";
