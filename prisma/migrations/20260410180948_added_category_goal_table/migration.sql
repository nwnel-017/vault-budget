/*
  Warnings:

  - You are about to drop the column `month_start` on the `category_goal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category_id]` on the table `category_goal` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "category_goal_category_id_month_start_key";

-- DropIndex
DROP INDEX "category_goal_month_start_idx";

-- AlterTable
ALTER TABLE "category_goal" DROP COLUMN "month_start";

-- CreateIndex
CREATE UNIQUE INDEX "category_goal_category_id_key" ON "category_goal"("category_id");
