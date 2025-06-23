/*
  Warnings:

  - You are about to drop the column `downloads` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `max_participants` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `committee_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `complains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `constitutions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `newsletters` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `agency_id` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exam_link` to the `exam_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberKind" AS ENUM ('ADVISER', 'HONORABLE', 'EXECUTIVE', 'ASSOCIATE', 'STUDENT_REPRESENTATIVE');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "committee_members" DROP CONSTRAINT "committee_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "complains" DROP CONSTRAINT "complains_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_approved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_for_id_fkey";

-- AlterTable
ALTER TABLE "agencies" DROP COLUMN "downloads",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "certifications" DROP COLUMN "is_active",
DROP COLUMN "user_id",
ADD COLUMN     "agency_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "max_participants";

-- AlterTable
ALTER TABLE "exam_registrations" ADD COLUMN     "exam_link" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "kind" "MemberKind" NOT NULL;

-- DropTable
DROP TABLE "News";

-- DropTable
DROP TABLE "committee_members";

-- DropTable
DROP TABLE "complains";

-- DropTable
DROP TABLE "constitutions";

-- DropTable
DROP TABLE "event_participants";

-- DropTable
DROP TABLE "memberships";

-- DropTable
DROP TABLE "newsletters";

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
