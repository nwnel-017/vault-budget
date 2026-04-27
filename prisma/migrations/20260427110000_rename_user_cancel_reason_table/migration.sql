-- Rename the table so it matches the Prisma @@map value.
ALTER TABLE "UserCancelReason"
RENAME TO "user_cancel_reason";

-- Keep the primary key constraint name aligned with the table name.
ALTER TABLE "user_cancel_reason"
RENAME CONSTRAINT "UserCancelReason_pkey" TO "user_cancel_reason_pkey";
