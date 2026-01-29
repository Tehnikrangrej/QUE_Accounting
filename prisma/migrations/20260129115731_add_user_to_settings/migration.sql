/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TenantConfiguration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TenantConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE tenantconfiguration_id_seq;
ALTER TABLE "TenantConfiguration" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('tenantconfiguration_id_seq');
ALTER SEQUENCE tenantconfiguration_id_seq OWNED BY "TenantConfiguration"."id";

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfiguration_userId_key" ON "TenantConfiguration"("userId");

-- AddForeignKey
ALTER TABLE "TenantConfiguration" ADD CONSTRAINT "TenantConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
