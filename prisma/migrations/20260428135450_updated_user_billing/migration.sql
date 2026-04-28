/*
  Warnings:

  - You are about to drop the column `cancel_at` on the `user_billing` table. All the data in the column will be lost.
  - You are about to drop the column `canceled_at` on the `user_billing` table. All the data in the column will be lost.
  - You are about to drop the column `current_period_start` on the `user_billing` table. All the data in the column will be lost.
  - You are about to drop the column `ended_at` on the `user_billing` table. All the data in the column will be lost.
  - You are about to drop the column `last_stripe_event_id` on the `user_billing` table. All the data in the column will be lost.
  - You are about to drop the column `trial_end` on the `user_billing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_billing" DROP COLUMN "cancel_at",
DROP COLUMN "canceled_at",
DROP COLUMN "current_period_start",
DROP COLUMN "ended_at",
DROP COLUMN "last_stripe_event_id",
DROP COLUMN "trial_end";

-- CreateIndex
CREATE INDEX "user_cancel_reason_user_id_idx" ON "user_cancel_reason"("user_id");
