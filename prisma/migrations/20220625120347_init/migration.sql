/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `userAddresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "userAddresses" DROP COLUMN "refreshToken";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refreshToken" TEXT;
