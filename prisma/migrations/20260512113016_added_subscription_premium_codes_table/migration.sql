-- CreateTable
CREATE TABLE "subscription_premium_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_premium_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_premium_codes_code_key" ON "subscription_premium_codes"("code");

-- CreateIndex
CREATE INDEX "subscription_premium_codes_code_idx" ON "subscription_premium_codes"("code");

-- CreateIndex
CREATE INDEX "subscription_premium_codes_is_active_idx" ON "subscription_premium_codes"("is_active");

-- CreateIndex
CREATE INDEX "subscription_premium_codes_expires_at_idx" ON "subscription_premium_codes"("expires_at");
