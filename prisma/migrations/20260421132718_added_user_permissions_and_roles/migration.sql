-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accountTier" "AccountTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
