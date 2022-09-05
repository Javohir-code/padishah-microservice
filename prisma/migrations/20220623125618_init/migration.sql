/*
  Warnings:

  - You are about to drop the `Addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('UZ', 'RU');

-- DropForeignKey
ALTER TABLE "Addresses" DROP CONSTRAINT "Addresses_districtId_fkey";

-- DropForeignKey
ALTER TABLE "Addresses" DROP CONSTRAINT "Addresses_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Addresses" DROP CONSTRAINT "Addresses_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoleUsers" DROP CONSTRAINT "RoleUsers_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleUsers" DROP CONSTRAINT "RoleUsers_userId_fkey";

-- DropTable
DROP TABLE "Addresses";

-- DropTable
DROP TABLE "Roles";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "msisdn" VARCHAR(50) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT E'ACTIVE',
    "language" "Language",
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAddresses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "latitude" VARCHAR(255) NOT NULL,
    "longitude" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "street" VARCHAR(255),
    "city" VARCHAR(255),
    "home" VARCHAR(255),
    "apartment" VARCHAR(255),
    "comment" VARCHAR(1000) NOT NULL,
    "domofon" VARCHAR(255),
    "address" VARCHAR(255),
    "regionId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "userAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_msisdn_key" ON "users"("msisdn");

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "Districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUsers" ADD CONSTRAINT "RoleUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUsers" ADD CONSTRAINT "RoleUsers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
