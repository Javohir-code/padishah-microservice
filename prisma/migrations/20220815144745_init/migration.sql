/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `roleUsers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId]` on the table `roleUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "roles_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "roleUsers_userId_key" ON "roleUsers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roleUsers_roleId_key" ON "roleUsers"("roleId");
