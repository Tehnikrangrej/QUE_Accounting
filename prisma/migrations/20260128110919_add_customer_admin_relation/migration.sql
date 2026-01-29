/*
  Warnings:

  - You are about to drop the `_CustomerAdmins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CustomerAdmins" DROP CONSTRAINT "_CustomerAdmins_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomerAdmins" DROP CONSTRAINT "_CustomerAdmins_B_fkey";

-- DropTable
DROP TABLE "_CustomerAdmins";
