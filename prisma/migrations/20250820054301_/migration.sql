-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'OVERDUE');

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_payment_month" TEXT,
ADD COLUMN     "subscription_end_date" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "agency_subscription_payments" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "payment_month" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "notes" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agency_subscription_payments_agency_id_payment_month_key" ON "agency_subscription_payments"("agency_id", "payment_month");

-- AddForeignKey
ALTER TABLE "agency_subscription_payments" ADD CONSTRAINT "agency_subscription_payments_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_subscription_payments" ADD CONSTRAINT "agency_subscription_payments_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
