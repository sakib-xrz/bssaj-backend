/*
  Warnings:

  - You are about to drop the column `is_active` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `company_name` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posted_by_id` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobKind" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "is_active",
DROP COLUMN "location",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "company_address" TEXT,
ADD COLUMN     "company_email" TEXT,
ADD COLUMN     "company_logo" TEXT,
ADD COLUMN     "company_name" TEXT NOT NULL,
ADD COLUMN     "company_phone" TEXT,
ADD COLUMN     "company_website" TEXT,
ADD COLUMN     "experience_min" INTEGER,
ADD COLUMN     "kind" "JobKind" NOT NULL,
ADD COLUMN     "number_of_vacancies" INTEGER,
ADD COLUMN     "posted_by_agency_id" TEXT,
ADD COLUMN     "posted_by_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_agency_id_fkey" FOREIGN KEY ("posted_by_agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
