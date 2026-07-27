-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobItemProductionStatus" AS ENUM ('DRAFT', 'PENDING_PRODUCTION', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "job_no" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "job_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMPTZ,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "assigned_operator" TEXT,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "quality_checked_at" TIMESTAMPTZ,
    "quality_checked_by" TEXT,
    "delivered_at" TIMESTAMPTZ,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_items" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "design_id" UUID,
    "position" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "line_total" DOUBLE PRECISION NOT NULL,
    "thread_color" TEXT,
    "dimensions" TEXT,
    "remarks" TEXT,
    "production_status" "JobItemProductionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_job_no_key" ON "jobs"("job_no");

-- CreateIndex
CREATE INDEX "jobs_job_no_idx" ON "jobs"("job_no");

-- CreateIndex
CREATE INDEX "jobs_customer_id_idx" ON "jobs"("customer_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_priority_idx" ON "jobs"("priority");

-- CreateIndex
CREATE INDEX "jobs_assigned_operator_idx" ON "jobs"("assigned_operator");

-- CreateIndex
CREATE INDEX "jobs_deleted_at_idx" ON "jobs"("deleted_at");

-- CreateIndex
CREATE INDEX "job_items_job_id_idx" ON "job_items"("job_id");

-- CreateIndex
CREATE INDEX "job_items_design_id_idx" ON "job_items"("design_id");

-- CreateIndex
CREATE INDEX "job_items_production_status_idx" ON "job_items"("production_status");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
