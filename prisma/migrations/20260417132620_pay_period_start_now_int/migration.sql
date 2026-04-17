/*
  Warnings:

  - You are about to drop the column `pay_period_begin` on the `user_pay_period` table. All the data in the column will be lost.
  - Added the required column `pay_period_start_day` to the `user_pay_period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_pay_period" DROP COLUMN "pay_period_begin",
ADD COLUMN     "pay_period_start_day" INTEGER NOT NULL;
