import Stripe from "stripe";
import db from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// TO DO - change this code later - do not recall updateSubscriptionStatus on every action

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

async function getUser(subscription: Stripe.Subscription) {
  const stripeCustomerId =
    typeof subscription.customer === "string" ? subscription.customer : null;

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

  return {
    userId: billing?.user_id ?? null,
    stripeCustomerId,
  };
}

async function updateSubscriptionStatus(
  subscription: Stripe.Subscription,
  options?: {
    userId?: string;
  },
) {
  const resolvedUser = await getUser(subscription);
  const userId = options?.userId ?? resolvedUser.userId;

  if (!userId) {
    throw new Error("Unable to find a user for this Stripe subscription.");
  }

  const currentPeriodEndDate = getDateFromUnixTimestamp(
    getSubscriptionPeriodEnd(subscription),
  );
  const shouldUseFreeTier =
    subscription.status === "canceled" || subscription.status === "unpaid";

  await db.userBilling.upsert({
    where: {
      user_id: userId,
    },
    create: {
      user_id: userId,
      stripe_customer_id: resolvedUser.stripeCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: getSubscriptionPriceId(subscription),
      subscription_status: subscription.status,
      current_period_end: currentPeriodEndDate,
      access_expires_at: currentPeriodEndDate,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    update: {
      stripe_customer_id: resolvedUser.stripeCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: getSubscriptionPriceId(subscription),
      subscription_status: subscription.status,
      current_period_end: currentPeriodEndDate,
      access_expires_at: currentPeriodEndDate,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  });

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      accountTier: shouldUseFreeTier ? "FREE" : "PREMIUM",
    },
  });
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

  const stripe = new Stripe(stripeSecretKey!);
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  await updateSubscriptionStatus(subscription, {
    userId,
  });
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

  const stripe = new Stripe(stripeSecretKey);
  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
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
      case "customer.subscription.updated":
        await updateSubscriptionStatus(event.data.object);
        break;
      case "customer.subscription.deleted":
        await updateSubscriptionStatus(event.data.object);
        break;
      default:
        break;
    }
  } catch (error) {
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
