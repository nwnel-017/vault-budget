-- CreateTable
CREATE TABLE "transaction_rule" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_rule_user_id_idx" ON "transaction_rule"("user_id");

-- CreateIndex
CREATE INDEX "transaction_rule_category_id_idx" ON "transaction_rule"("category_id");

-- CreateIndex
CREATE INDEX "transaction_rule_pattern_idx" ON "transaction_rule"("pattern");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_rule_user_id_pattern_key" ON "transaction_rule"("user_id", "pattern");

-- AddForeignKey
ALTER TABLE "transaction_rule" ADD CONSTRAINT "transaction_rule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_rule" ADD CONSTRAINT "transaction_rule_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
