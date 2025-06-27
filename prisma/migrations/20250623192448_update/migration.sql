/*
  Warnings:

  - You are about to drop the column `agency_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `agencies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `agencies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_agency_id_fkey";

-- DropIndex
DROP INDEX "users_agency_id_key";

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "userId" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "agency_id",
ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "agencies_user_id_key" ON "agencies"("user_id");

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
