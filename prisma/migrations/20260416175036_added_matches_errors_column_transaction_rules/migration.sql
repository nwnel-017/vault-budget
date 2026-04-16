-- AlterTable
ALTER TABLE "transaction_rule" ADD COLUMN     "errors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matches" INTEGER NOT NULL DEFAULT 0;
