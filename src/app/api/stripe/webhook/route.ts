import Stripe from "stripe";
import {
  handleCheckoutSessionCompleted,
  updateSubscriptionStatus,
} from "@/lib/subscriptions";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
        error:
          error instanceof Error
            ? `Webhook signature verification failed: ${error.message}`
            : "Webhook signature verification failed.",
      },
      { status: 400 },
    );
  }

  try {
    await handleWebhookEvent(stripe, event);
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

async function handleWebhookEvent(stripe: Stripe, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(stripe, event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await updateSubscriptionStatus(event.data.object);
      break;
    default:
      break;
  }
}
