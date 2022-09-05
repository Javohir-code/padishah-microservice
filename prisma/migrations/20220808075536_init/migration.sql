/*
  Warnings:

  - The values [CUSTOMER] on the enum `RolesEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RolesEnum_new" AS ENUM ('CLIENT', 'MERCHANT', 'ADMIN');
ALTER TABLE "roles" ALTER COLUMN "name" TYPE "RolesEnum_new" USING ("name"::text::"RolesEnum_new");
ALTER TYPE "RolesEnum" RENAME TO "RolesEnum_old";
ALTER TYPE "RolesEnum_new" RENAME TO "RolesEnum";
DROP TYPE "RolesEnum_old";
COMMIT;
