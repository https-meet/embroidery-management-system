-- 1. Repair missing columns on users table
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMPTZ;

-- Add users.created_by Foreign Key
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_created_by_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE "users" 
      ADD CONSTRAINT "users_created_by_fkey" 
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. Create Enums for Materials if not existing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaterialCategory') THEN
    CREATE TYPE "MaterialCategory" AS ENUM ('THREAD', 'FABRIC', 'BACKING', 'NEEDLE', 'PACKAGING', 'ACCESSORY', 'OTHER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaterialUnit') THEN
    CREATE TYPE "MaterialUnit" AS ENUM ('PCS', 'KG', 'GRAM', 'METER', 'ROLL', 'CONE', 'BOX', 'PACKET', 'LITER', 'OTHER');
  END IF;
END $$;

-- 3. Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "last_ip_address" TEXT,
    "user_agent" TEXT,
    "revoked_at" TIMESTAMPTZ,
    "revoked_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_used_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_refresh_token_hash_idx" ON "sessions"("refresh_token_hash");

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sessions_user_id_fkey' AND table_name = 'sessions'
  ) THEN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Create materials table
CREATE TABLE IF NOT EXISTS "materials" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "brand" TEXT,
    "color_name" TEXT,
    "color_code" TEXT,
    "category" "MaterialCategory" NOT NULL DEFAULT 'OTHER',
    "unit" "MaterialUnit" NOT NULL DEFAULT 'PCS',
    "purchase_price" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "selling_price" DECIMAL(12,2),
    "minimum_stock" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "current_stock" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "materials_name_key" ON "materials"("name");
CREATE INDEX IF NOT EXISTS "materials_name_idx" ON "materials"("name");
CREATE INDEX IF NOT EXISTS "materials_sku_idx" ON "materials"("sku");
CREATE INDEX IF NOT EXISTS "materials_brand_idx" ON "materials"("brand");

-- 5. Create suppliers table
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gst_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "postal_code" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_name_key" ON "suppliers"("name");
CREATE INDEX IF NOT EXISTS "suppliers_name_idx" ON "suppliers"("name");
CREATE INDEX IF NOT EXISTS "suppliers_phone_idx" ON "suppliers"("phone");
CREATE INDEX IF NOT EXISTS "suppliers_email_idx" ON "suppliers"("email");
CREATE INDEX IF NOT EXISTS "suppliers_gst_number_idx" ON "suppliers"("gst_number");
CREATE INDEX IF NOT EXISTS "suppliers_city_idx" ON "suppliers"("city");

-- 6. Create purchases table
CREATE TABLE IF NOT EXISTS "purchases" (
    "id" UUID NOT NULL,
    "purchase_number" TEXT NOT NULL,
    "supplier_id" UUID NOT NULL,
    "purchase_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMPTZ,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "inventory_updated" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- 7. Create purchase_items table
CREATE TABLE IF NOT EXISTS "purchase_items" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "purchases_purchase_number_key" ON "purchases"("purchase_number");
CREATE INDEX IF NOT EXISTS "purchases_purchase_number_idx" ON "purchases"("purchase_number");
CREATE INDEX IF NOT EXISTS "purchases_supplier_id_idx" ON "purchases"("supplier_id");
CREATE INDEX IF NOT EXISTS "purchases_purchase_date_idx" ON "purchases"("purchase_date");
CREATE INDEX IF NOT EXISTS "purchases_invoice_number_idx" ON "purchases"("invoice_number");
CREATE INDEX IF NOT EXISTS "purchases_inventory_updated_idx" ON "purchases"("inventory_updated");
CREATE INDEX IF NOT EXISTS "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");
CREATE INDEX IF NOT EXISTS "purchase_items_material_id_idx" ON "purchase_items"("material_id");

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchases_supplier_id_fkey' AND table_name = 'purchases'
  ) THEN
    ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchase_items_purchase_id_fkey' AND table_name = 'purchase_items'
  ) THEN
    ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchase_items_material_id_fkey' AND table_name = 'purchase_items'
  ) THEN
    ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
