-- CreateTable
CREATE TABLE "designs" (
    "id" UUID NOT NULL,
    "design_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "preview_url" TEXT,
    "primary_file_url" TEXT,
    "primary_file_type" TEXT,
    "stitch_count" INTEGER,
    "width_mm" DOUBLE PRECISION,
    "height_mm" DOUBLE PRECISION,
    "color_count" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "designs_design_code_key" ON "designs"("design_code");

-- CreateIndex
CREATE INDEX "designs_design_code_idx" ON "designs"("design_code");

-- CreateIndex
CREATE INDEX "designs_name_idx" ON "designs"("name");

-- CreateIndex
CREATE INDEX "designs_category_idx" ON "designs"("category");

-- CreateIndex
CREATE INDEX "designs_deleted_at_idx" ON "designs"("deleted_at");
