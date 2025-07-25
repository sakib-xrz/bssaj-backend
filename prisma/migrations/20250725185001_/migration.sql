/*
  Warnings:

  - You are about to drop the column `is_active` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `scholarships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "news" DROP COLUMN "is_active",
DROP COLUMN "published_at";

-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "is_active";
