/*
  Warnings:

  - You are about to drop the column `posted_by_agency_id` on the `jobs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_posted_by_agency_id_fkey";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "posted_by_agency_id";
