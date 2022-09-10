-- CreateEnum
CREATE TYPE "OtpReason" AS ENUM ('FORGETPASSWORD', 'LOGIN');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('UNCONFIRMED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "RolesEnum" AS ENUM ('CLIENT', 'MERCHANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCK', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('UZ', 'RU', 'ENG');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "middleName" VARCHAR(255),
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "msisdn" VARCHAR(50) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT E'ACTIVE',
    "language" "Language" NOT NULL DEFAULT E'UZ',
    "refreshToken" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "RolesEnum" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
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
    "reason" "OtpReason" NOT NULL DEFAULT E'LOGIN',
    "ip" TEXT,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "attempts" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "verifyCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_msisdn_key" ON "users"("msisdn");

-- CreateIndex
CREATE UNIQUE INDEX "roleUsers_userId_key" ON "roleUsers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verifyCodes_msisdn_key" ON "verifyCodes"("msisdn");

-- CreateIndex
CREATE UNIQUE INDEX "verifyCodes_email_key" ON "verifyCodes"("email");

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAddresses" ADD CONSTRAINT "userAddresses_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleUsers" ADD CONSTRAINT "roleUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleUsers" ADD CONSTRAINT "roleUsers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
