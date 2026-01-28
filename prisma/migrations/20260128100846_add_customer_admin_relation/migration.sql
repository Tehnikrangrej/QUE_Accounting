-- CreateTable
CREATE TABLE "_CustomerAdmins" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CustomerAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CustomerAdmins_B_index" ON "_CustomerAdmins"("B");

-- AddForeignKey
ALTER TABLE "_CustomerAdmins" ADD CONSTRAINT "_CustomerAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerAdmins" ADD CONSTRAINT "_CustomerAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
