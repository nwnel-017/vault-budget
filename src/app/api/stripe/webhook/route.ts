import Stripe from "stripe";
import db from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// TO DO - review this function
async function upgradeUserToPremium(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error("Missing user id in checkout session metadata.");
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  let subscriptionDetails: Stripe.Subscription | null = null;

  if (stripeSubscriptionId) {
    const stripe = new Stripe(stripeSecretKey!);

    // Load the live subscription details so billing data is complete.
    subscriptionDetails =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);
  }

  await db.$transaction([
    // Mark the user as premium after Stripe confirms checkout completed.
    db.user.update({
      where: {
        id: userId,
      },
      data: {
        accountTier: "PREMIUM",
      },
    }),
    db.userBilling.upsert({
      where: {
        user_id: userId,
      },
      create: {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: subscriptionDetails?.items.data[0]?.price.id ?? null,
        subscription_status: subscriptionDetails?.status ?? null,
        cancel_at_period_end:
          subscriptionDetails?.cancel_at_period_end ?? false,
      },
      update: {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: subscriptionDetails?.items.data[0]?.price.id ?? null,
        subscription_status: subscriptionDetails?.status ?? null,
        cancel_at_period_end:
          subscriptionDetails?.cancel_at_period_end ?? false,
      },
    }),
  ]);
}

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    console.log("missng secret key");
    return Response.json(
      { error: "Missing Stripe secret key." },
      { status: 500 },
    );
  }

  if (!stripeWebhookSecret) {
    console.log("missing webhook secret");
    return Response.json(
      { error: "Missing Stripe webhook secret." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.log("missng signature");
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const payload = await request.text();
  let event: Stripe.Event;

  try {
    // Stripe needs the unchanged body text to verify the webhook.
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    console.log("error: " + error);
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
    switch (event.type) {
      case "checkout.session.completed":
        console.log(
          "checkout session was completed - attempting to upgrade user to premium",
        );
        await upgradeUserToPremium(event.data.object);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process Stripe webhook.",
      },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}
