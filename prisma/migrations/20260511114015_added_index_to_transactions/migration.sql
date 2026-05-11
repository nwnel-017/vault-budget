-- CreateIndex
CREATE INDEX "transaction_user_id_date_purchased_idx" ON "transaction"("user_id", "date_purchased");
