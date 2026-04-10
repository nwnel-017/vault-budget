-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "transaction_rule_id" TEXT;

-- CreateIndex
CREATE INDEX "transaction_transaction_rule_id_idx" ON "transaction"("transaction_rule_id");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transaction_rule_id_fkey" FOREIGN KEY ("transaction_rule_id") REFERENCES "transaction_rule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
