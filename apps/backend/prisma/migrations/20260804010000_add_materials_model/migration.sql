-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('THREAD', 'FABRIC', 'BACKING', 'NEEDLE', 'PACKAGING', 'ACCESSORY', 'OTHER');

-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('PCS', 'KG', 'GRAM', 'METER', 'ROLL', 'CONE', 'BOX', 'PACKET', 'LITER', 'OTHER');

-- CreateTable
CREATE TABLE "materials" (
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

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name");

-- CreateIndex
CREATE INDEX "materials_name_idx" ON "materials"("name");

-- CreateIndex
CREATE INDEX "materials_sku_idx" ON "materials"("sku");

-- CreateIndex
CREATE INDEX "materials_brand_idx" ON "materials"("brand");

-- CreateIndex
CREATE INDEX "materials_category_idx" ON "materials"("category");

-- CreateIndex
CREATE INDEX "materials_is_active_idx" ON "materials"("is_active");
