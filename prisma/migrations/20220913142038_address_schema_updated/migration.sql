/*
  Warnings:

  - You are about to drop the column `apartment` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `domofon` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `home` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `userAddresses` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `userAddresses` table. All the data in the column will be lost.
  - Made the column `address` on table `userAddresses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "userAddresses" DROP COLUMN "apartment",
DROP COLUMN "city",
DROP COLUMN "domofon",
DROP COLUMN "home",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
DROP COLUMN "street",
ADD COLUMN     "default" BOOLEAN,
ADD COLUMN     "postalCode" VARCHAR(255),
ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "address" SET NOT NULL;
