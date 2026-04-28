/*
  Warnings:

  - You are about to drop the column `current_period_end` on the `user_billing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_billing" DROP COLUMN "current_period_end",
ADD COLUMN     "access_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_cancel_reason_user_id_idx" ON "user_cancel_reason"("user_id");
