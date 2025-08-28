-- CreateEnum
CREATE TYPE "ConsultationKind" AS ENUM ('ACADEMIC_CONSULTATION', 'CAREER_CONSULTATION', 'VISA_AND_IMMIGRATION_CONSULTATION', 'PERSONAL_CONSULTATION');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'RESOLVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "kind" "ConsultationKind" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);
