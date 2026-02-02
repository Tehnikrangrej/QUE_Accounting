-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "canCreateCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canDeleteCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canUpdateCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canViewCustomer" BOOLEAN NOT NULL DEFAULT false;
