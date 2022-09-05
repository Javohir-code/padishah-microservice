/*
  Warnings:

  - The values [CLIENT,SELLER] on the enum `RolesEnum` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `name` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RolesEnum_new" AS ENUM ('CUSTOMER', 'MERCHANT', 'ADMIN');
ALTER TABLE "roles" ALTER COLUMN "name" TYPE "RolesEnum_new" USING ("name"::text::"RolesEnum_new");
ALTER TYPE "RolesEnum" RENAME TO "RolesEnum_old";
ALTER TYPE "RolesEnum_new" RENAME TO "RolesEnum";
DROP TYPE "RolesEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "name",
ADD COLUMN     "name" "RolesEnum" NOT NULL;

-- AlterTable
ALTER TABLE "userAddresses" ADD COLUMN     "refreshToken" TEXT;
