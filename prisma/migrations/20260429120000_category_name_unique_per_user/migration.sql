-- CreateIndex
CREATE UNIQUE INDEX "category_user_id_category_name_key" ON "category"("user_id", "category_name");
