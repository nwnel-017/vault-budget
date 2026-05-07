-- CreateTable
CREATE TABLE "processed_stripe_event" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "stripe_object_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processed_stripe_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_stripe_event_event_id_key" ON "processed_stripe_event"("event_id");

-- CreateIndex
CREATE INDEX "processed_stripe_event_event_type_idx" ON "processed_stripe_event"("event_type");

-- CreateIndex
CREATE INDEX "processed_stripe_event_stripe_object_id_idx" ON "processed_stripe_event"("stripe_object_id");
