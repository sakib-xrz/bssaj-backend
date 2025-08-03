/*
  Warnings:

  - You are about to drop the column `approved_by_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_approved_by_id_fkey";

-- DropIndex
DROP INDEX "events_slug_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "approved_by_id",
DROP COLUMN "slug",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "EventStatus";
