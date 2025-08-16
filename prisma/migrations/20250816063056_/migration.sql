-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "agency_email" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
