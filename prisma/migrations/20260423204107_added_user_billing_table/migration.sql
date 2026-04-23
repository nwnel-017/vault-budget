-- CreateTable
CREATE TABLE "user_billing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "subscription_status" TEXT,
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_billing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_billing_stripe_subscription_id_key" ON "user_billing"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_billing_stripe_customer_id_idx" ON "user_billing"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_billing_user_id_key" ON "user_billing"("user_id");

-- AddForeignKey
ALTER TABLE "user_billing" ADD CONSTRAINT "user_billing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
