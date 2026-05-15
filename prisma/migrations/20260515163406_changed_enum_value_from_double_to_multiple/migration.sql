/*
  Warnings:

  - The values [DOUBLE] on the enum `AmountMappingMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AmountMappingMode_new" AS ENUM ('SINGLE', 'MULTIPLE');
ALTER TABLE "public"."user_column_mappings" ALTER COLUMN "mode" DROP DEFAULT;
ALTER TABLE "user_column_mappings" ALTER COLUMN "mode" TYPE "AmountMappingMode_new" USING ("mode"::text::"AmountMappingMode_new");
ALTER TYPE "AmountMappingMode" RENAME TO "AmountMappingMode_old";
ALTER TYPE "AmountMappingMode_new" RENAME TO "AmountMappingMode";
DROP TYPE "public"."AmountMappingMode_old";
ALTER TABLE "user_column_mappings" ALTER COLUMN "mode" SET DEFAULT 'SINGLE';
COMMIT;
