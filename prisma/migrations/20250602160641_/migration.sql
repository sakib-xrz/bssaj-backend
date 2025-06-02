/*
  Warnings:

  - You are about to drop the column `user_type` on the `user` table. All the data in the column will be lost.
  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER', 'STUDENT', 'AGENCY', 'COMMITTEE');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "user_type",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "UserType";
