-- CreateEnum
CREATE TYPE "UserSelectionType" AS ENUM ('NEW', 'EXISTING');

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "user_selection_type" "UserSelectionType" NOT NULL DEFAULT 'NEW';
