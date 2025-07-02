/*
  Warnings:

  - You are about to drop the column `message_from_director` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `services_offered` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `success_stories` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `agencies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agencies" DROP COLUMN "message_from_director",
DROP COLUMN "services_offered",
DROP COLUMN "success_stories",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "AgencySuccessStory" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "AgencySuccessStory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgencySuccessStory" ADD CONSTRAINT "AgencySuccessStory_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
