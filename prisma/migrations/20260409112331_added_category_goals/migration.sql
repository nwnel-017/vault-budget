-- CreateTable
CREATE TABLE "category_goal" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "month_start" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_goal_month_start_idx" ON "category_goal"("month_start");

-- CreateIndex
CREATE UNIQUE INDEX "category_goal_category_id_month_start_key" ON "category_goal"("category_id", "month_start");

-- AddForeignKey
ALTER TABLE "category_goal" ADD CONSTRAINT "category_goal_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
