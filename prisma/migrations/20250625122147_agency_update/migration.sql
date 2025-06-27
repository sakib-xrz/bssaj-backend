/*
  Warnings:

  - You are about to drop the column `approved_by_id` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `members` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_approved_by_id_fkey";

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "status" "AgencyStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "members" DROP COLUMN "approved_by_id",
DROP COLUMN "designation",
ADD COLUMN     "action_id" TEXT;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
