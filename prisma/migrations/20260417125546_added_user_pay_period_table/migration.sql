-- CreateTable
CREATE TABLE "user_pay_period" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pay_period_begin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pay_period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_pay_period_id_idx" ON "user_pay_period"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_pay_period_user_id_key" ON "user_pay_period"("user_id");

-- AddForeignKey
ALTER TABLE "user_pay_period" ADD CONSTRAINT "user_pay_period_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
