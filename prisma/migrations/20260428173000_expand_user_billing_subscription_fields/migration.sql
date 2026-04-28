ALTER TABLE "user_billing"
ADD COLUMN "current_period_start" TIMESTAMP(3),
ADD COLUMN "access_expires_at" TIMESTAMP(3),
ADD COLUMN "cancel_at" TIMESTAMP(3),
ADD COLUMN "canceled_at" TIMESTAMP(3),
ADD COLUMN "ended_at" TIMESTAMP(3),
ADD COLUMN "trial_end" TIMESTAMP(3),
ADD COLUMN "last_stripe_event_id" TEXT;
