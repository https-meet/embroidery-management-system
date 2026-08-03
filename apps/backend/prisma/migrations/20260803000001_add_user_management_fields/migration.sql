-- AlterTable
ALTER TABLE "users" 
  ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "created_by" UUID,
  ADD COLUMN "last_login_at" TIMESTAMPTZ;

-- AddForeignKey
ALTER TABLE "users" 
  ADD CONSTRAINT "users_created_by_fkey" 
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
