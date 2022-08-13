/*
  Warnings:

  - You are about to drop the `Districts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Merchant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MerchantCompany` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Regions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoleUsers" DROP CONSTRAINT "RoleUsers_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleUsers" DROP CONSTRAINT "RoleUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "userAddresses" DROP CONSTRAINT "userAddresses_districtId_fkey";

-- DropForeignKey
ALTER TABLE "userAddresses" DROP CONSTRAINT "userAddresses_regionId_fkey";

-- DropTable
DROP TABLE "Districts";

-- DropTable
DROP TABLE "Merchant";

-- DropTable
DROP TABLE "MerchantCompany";

-- DropTable
DROP TABLE "Otp";

-- DropTable
DROP TABLE "Regions";

-- DropTable
DROP TABLE "RoleUsers";

-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roleUsers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "roleUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifyCodes" (
    "id" SERIAL NOT NULL,
    "msisdn" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "code" TEXT NOT NULL,
    "status" "OtpStatus" NOT NULL DEFAULT E'UNCONFIRMED',
    "ip" TEXT,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "attempts" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "verifyCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verifyCodes_msisdn_key" ON "verifyCodes"("msisdn");

-- CreateIndex
CREATE UNIQUE INDEX "verifyCodes_email_key" ON "verifyCodes"("email");

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleUsers" ADD CONSTRAINT "roleUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleUsers" ADD CONSTRAINT "roleUsers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
