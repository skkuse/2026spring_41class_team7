-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('DEVELOPER', 'COMPANY');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "allowContact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "userType" "UserType";

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "companyUserId" TEXT NOT NULL,
    "devUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_companyUserId_devUserId_key" ON "Shortlist"("companyUserId", "devUserId");

-- CreateIndex
CREATE INDEX "Shortlist_companyUserId_idx" ON "Shortlist"("companyUserId");
