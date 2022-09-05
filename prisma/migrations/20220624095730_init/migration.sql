/*
  Warnings:

  - Made the column `language` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OtpReason" AS ENUM ('FORGETPASSWORD', 'LOGIN');

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'ENG';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "language" SET DEFAULT E'UZ';

-- AlterTable
ALTER TABLE "verifyCodes" ADD COLUMN     "reason" "OtpReason" NOT NULL DEFAULT E'LOGIN';
