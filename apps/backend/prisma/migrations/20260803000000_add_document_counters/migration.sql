-- CreateTable: business_config
CREATE TABLE IF NOT EXISTS "business_config" (
    "id" UUID NOT NULL,
    "company_name" TEXT NOT NULL DEFAULT 'EMBROIDERY BUSINESS',
    "logo_url" TEXT,
    "gstin" TEXT DEFAULT '24AAAAA0000A1Z5',
    "pan" TEXT,
    "address" TEXT DEFAULT 'Ring Road, Surat, Gujarat - 395002, India',
    "mobile" TEXT DEFAULT '+91 98765 43210',
    "email" TEXT DEFAULT 'info@embroidery.com',
    "website" TEXT DEFAULT 'https://embroidery-management.com',
    "bank_name" TEXT DEFAULT 'HDFC Bank, Surat Branch',
    "account_no" TEXT DEFAULT '50200012345678',
    "ifsc_code" TEXT DEFAULT 'HDFC0000123',
    "upi_id" TEXT DEFAULT 'embroidery@upi',
    "upi_qr_url" TEXT,
    "invoice_footer" TEXT DEFAULT 'Payment due within 15 days of invoice date. Thank you for your business.',
    "job_prefix" TEXT NOT NULL DEFAULT 'JOB-',
    "invoice_prefix" TEXT NOT NULL DEFAULT 'INV-',
    "payment_prefix" TEXT NOT NULL DEFAULT 'PAY-',
    "default_tax_rate_percentage" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "default_payment_terms_days" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "business_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable: audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "user_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "previous_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: document_counters
CREATE TABLE IF NOT EXISTS "document_counters" (
    "entity_type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_sequence" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_counters_pkey" PRIMARY KEY ("entity_type","year")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
