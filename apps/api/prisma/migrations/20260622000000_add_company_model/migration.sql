-- AlterTable
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "companyName",
DROP COLUMN IF EXISTS "industry",
ADD COLUMN IF NOT EXISTS "activeCompanyId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_profileId_idx" ON "Company"("profileId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
