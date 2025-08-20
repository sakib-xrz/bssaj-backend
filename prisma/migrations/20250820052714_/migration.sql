/*
  Warnings:

  - You are about to drop the column `payment_id` on the `exam_registrations` table. All the data in the column will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exam_registrations" DROP CONSTRAINT "exam_registrations_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_approved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropIndex
DROP INDEX "exam_registrations_payment_id_key";

-- AlterTable
ALTER TABLE "exam_registrations" DROP COLUMN "payment_id";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PaymentType";
