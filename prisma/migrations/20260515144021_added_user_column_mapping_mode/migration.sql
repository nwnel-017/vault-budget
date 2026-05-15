-- CreateEnum
CREATE TYPE "AmountMappingMode" AS ENUM ('SINGLE', 'DOUBLE');

-- AlterTable
ALTER TABLE "user_column_mappings" ADD COLUMN     "mode" "AmountMappingMode" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "negativeColumns" JSONB,
ADD COLUMN     "positiveColumns" JSONB,
ALTER COLUMN "amount" DROP NOT NULL;
