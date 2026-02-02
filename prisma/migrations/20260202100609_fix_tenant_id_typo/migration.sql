/*
  Warnings:

  - You are about to drop the column `tentantId` on the `TenantConfiguration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId]` on the table `TenantConfiguration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `TenantConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TenantConfiguration" DROP CONSTRAINT "TenantConfiguration_tentantId_fkey";

-- DropIndex
DROP INDEX "TenantConfiguration_tentantId_key";

-- AlterTable
ALTER TABLE "TenantConfiguration" DROP COLUMN "tentantId",
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfiguration_tenantId_key" ON "TenantConfiguration"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantConfiguration" ADD CONSTRAINT "TenantConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
