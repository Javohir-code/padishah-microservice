-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('UNCONFIRMED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(255),
    "msisdn" VARCHAR(50),
    "region" VARCHAR(50),
    "district" VARCHAR(50),
    "address" VARCHAR(255),
    "address2" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(50) NOT NULL,
    "code" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "status" "OtpStatus" NOT NULL DEFAULT E'UNCONFIRMED',

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_msisdn_key" ON "User"("msisdn");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_identifier_key" ON "Otp"("identifier");
