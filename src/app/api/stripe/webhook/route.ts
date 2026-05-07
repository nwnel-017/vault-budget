import Stripe from "stripe";
import db from "@/lib/prisma";
import {
  handleCheckoutSessionCompleted,
  updateSubscriptionStatus,
} from "@/lib/subscriptions";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// TO DO - fix to handle concurrent requests
// Reviewed
export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return Response.json(
      { error: "Missing Stripe secret key." },
      { status: 500 },
    );
  }

  if (!stripeWebhookSecret) {
    return Response.json(
      { error: "Missing Stripe webhook secret." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  let stripe: Stripe;
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const payload = await request.text();

    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    console.log("Stripe webhook signature verification failed:", error);
    return Response.json(
      {
        error: "Webhook signature verification failed.",
      },
      { status: 400 },
    );
  }

  try {
    const isDuplicateEvent = await checkDuplicateEvent(event);

    if (isDuplicateEvent) {
      return Response.json({ received: true });
    }

    await handleWebhookEvent(stripe, event);
    await processWebhookEvent(event);
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return Response.json(
      {
        error:
          "Something went wrong! Please try again or contact support if the issue persists.",
      },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}

function getStripeObjectId(event: Stripe.Event) {
  const object = event.data.object as { id?: unknown };

  return typeof object?.id === "string" ? object.id : null;
}

async function processWebhookEvent(event: Stripe.Event) {
  try {
    await db.processedStripeEvent.create({
      data: {
        event_id: event.id,
        event_type: event.type,
        stripe_object_id: getStripeObjectId(event),
        processed_at: new Date(),
      },
    });
  } catch (error) {
    console.log("Failed to insert processed stripe event: " + error);
    throw new Error("Failed to insert processed stripe event.");
  }
}

async function checkDuplicateEvent(event: Stripe.Event) {
  try {
    const existingEvent = await db.processedStripeEvent.findUnique({
      where: {
        event_id: event.id,
      },
      select: {
        event_id: true,
      },
    });

    return Boolean(existingEvent);
  } catch (error) {
    console.log("Failed to check duplicate stripe event: " + error);
    throw new Error("Failed to check duplicate stripe event.");
  }
}

async function handleWebhookEvent(stripe: Stripe, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const result = await handleCheckoutSessionCompleted(
        stripe,
        event.data.object,
      );

      if (result.status === "ignored") {
        console.log(`Ignored Stripe event ${event.id}: ${result.reason}`);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const result = await updateSubscriptionStatus(event.data.object);

      if (result.status === "ignored") {
        console.log(`Ignored Stripe event ${event.id}: ${result.reason}`);
      }
      break;
    }
    default:
      break;
  }
}
