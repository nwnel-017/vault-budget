-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "file_upload_id" TEXT;

-- CreateTable
CREATE TABLE "user_file_upload" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_file_upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_file_upload_user_id_idx" ON "user_file_upload"("user_id");

-- CreateIndex
CREATE INDEX "user_file_upload_start_date_idx" ON "user_file_upload"("start_date");

-- CreateIndex
CREATE INDEX "user_file_upload_end_date_idx" ON "user_file_upload"("end_date");

-- CreateIndex
CREATE INDEX "transaction_file_upload_id_idx" ON "transaction"("file_upload_id");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_file_upload_id_fkey" FOREIGN KEY ("file_upload_id") REFERENCES "user_file_upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_file_upload" ADD CONSTRAINT "user_file_upload_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
