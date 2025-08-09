/*
  Warnings:

  - You are about to drop the column `certificate_type` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `certifications` table. All the data in the column will be lost.
  - Added the required column `completed_hours` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_duration` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `father_name` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institute_name` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_name` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sl_no` to the `certifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_agency_id_fkey";

-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_student_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_registrations" DROP CONSTRAINT "exam_registrations_issued_certificate_id_fkey";

-- AlterTable
ALTER TABLE "certifications" DROP COLUMN "certificate_type",
DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "file_url",
DROP COLUMN "updated_at",
ADD COLUMN     "certificate_url" TEXT,
ADD COLUMN     "completed_hours" INTEGER NOT NULL,
ADD COLUMN     "course_duration" INTEGER NOT NULL,
ADD COLUMN     "date_of_birth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "father_name" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "institute_name" TEXT NOT NULL,
ADD COLUMN     "mother_name" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sl_no" TEXT NOT NULL,
ALTER COLUMN "issued_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
