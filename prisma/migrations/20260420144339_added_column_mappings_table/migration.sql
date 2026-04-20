-- CreateTable
CREATE TABLE "user_column_mappings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "date_purchased" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_column_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_column_mappings_user_id_idx" ON "user_column_mappings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_column_mappings_user_id_key" ON "user_column_mappings"("user_id");

-- AddForeignKey
ALTER TABLE "user_column_mappings" ADD CONSTRAINT "user_column_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
