import Stripe from "stripe";
import db from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// TO DO - refactor

function getDateFromUnixTimestamp(value: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000);
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.id ?? null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.current_period_end ?? null;
}

function getStripeCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : null;
}

async function getUserId(subscription: Stripe.Subscription) {
  const stripeCustomerId = getStripeCustomerId(subscription);

  const billing = await db.userBilling.findFirst({
    where: {
      OR: [
        {
          stripe_subscription_id: subscription.id,
        },
        ...(stripeCustomerId
          ? [
              {
                stripe_customer_id: stripeCustomerId,
              },
            ]
          : []),
      ],
    },
    select: {
      user_id: true,
    },
  });

  return billing?.user_id ?? null;
}

async function updateSubscriptionStatus(
  subscription: Stripe.Subscription,
  options?: {
    userId?: string;
  },
) {
  const stripeCustomerId = getStripeCustomerId(subscription);
  const resolvedUserId = options?.userId ?? (await getUserId(subscription));

  if (!resolvedUserId) {
    throw new Error("Unable to find a user for this Stripe subscription.");
  }

  const currentPeriodEndDate = getDateFromUnixTimestamp(
    getSubscriptionPeriodEnd(subscription),
  );
  const shouldUseFreeTier =
    subscription.status === "canceled" || subscription.status === "unpaid";
  try {
    await db.$transaction(async (tx) => {
      await tx.userBilling.upsert({
        where: {
          user_id: resolvedUserId,
        },
        create: {
          user_id: resolvedUserId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: getSubscriptionPriceId(subscription),
          subscription_status: subscription.status,
          access_expires_at: currentPeriodEndDate,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        update: {
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: getSubscriptionPriceId(subscription),
          subscription_status: subscription.status,
          access_expires_at: currentPeriodEndDate,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
      });

      await tx.user.update({
        where: {
          id: resolvedUserId,
        },
        data: {
          accountTier: shouldUseFreeTier ? "FREE" : "PREMIUM",
        },
      });
    });
  } catch (error) {
    console.error("Error updating subscription status in database:", error);
    // return Response.json(
    //   { error: "Failed to update subscription status" },
    //   { status: 500 },
    // );
    throw new Error("Failed to update subscription status in database.");
  }
}

async function upgradeUserToPremium(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error("Missing user id in checkout session metadata.");
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  if (!stripeSubscriptionId) {
    throw new Error("Missing subscription id in checkout session.");
  }
  try {
    const stripe = new Stripe(stripeSecretKey!);
    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);

    await updateSubscriptionStatus(subscription, {
      userId,
    });
  } catch (error) {
    console.error("Error upgrading user to premium:", error);
    throw new Error(
      "Failed to upgrade user to premium after checkout. Please contact support if the issue persists.",
    );
  }
}

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
  try {
    const stripe = new Stripe(stripeSecretKey);
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
    switch (event.type) {
      case "checkout.session.completed":
        await upgradeUserToPremium(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updateSubscriptionStatus(event.data.object);
        break;
      default:
        break;
    }
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
