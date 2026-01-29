/*
  Warnings:

  - You are about to drop the column `logo` on the `TenantConfiguration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantConfiguration" DROP COLUMN "logo",
ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankAddress" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "swiftCode" TEXT;
