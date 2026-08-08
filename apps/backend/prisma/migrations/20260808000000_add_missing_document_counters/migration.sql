-- CreateTable: document_counters
CREATE TABLE IF NOT EXISTS "document_counters" (
    "entity_type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_sequence" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_counters_pkey"
      PRIMARY KEY ("entity_type", "year")
);
