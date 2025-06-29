-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "status" "BlogStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "approved_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
