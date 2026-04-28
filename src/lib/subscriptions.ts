import Stripe from "stripe";
import db from "@/lib/prisma";

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

function getBillingDetails(subscription: Stripe.Subscription) {
  const subscriptionPeriodEnd = getSubscriptionPeriodEnd(subscription);

  return {
    stripe_customer_id: getStripeCustomerId(subscription),
    stripe_subscription_id: subscription.id,
    stripe_price_id: getSubscriptionPriceId(subscription),
    subscription_status: subscription.status,
    access_expires_at: subscriptionPeriodEnd
      ? new Date(subscriptionPeriodEnd * 1000)
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };
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

// subscription.deleted -> the end of the final period for free tier was reached
export async function updateSubscriptionStatus(
  subscription: Stripe.Subscription,
  options?: {
    userId?: string;
  },
) {
  let resolvedUserId;

  if (options?.userId) {
    resolvedUserId = options.userId;
  } else {
    try {
      resolvedUserId = await getUserId(subscription);
    } catch (error) {
      throw new Error("Unable to find a user for this Stripe subscription.");
    }
  }

  if (!resolvedUserId) {
    throw new Error("Unable to find a user for this Stripe subscription.");
  }

  // This keeps the Stripe fields in one place for create and update.
  const billingDetails = getBillingDetails(subscription);
  const shouldUseFreeTier =
    subscription.status === "canceled" || subscription.status === "unpaid";

  await db.$transaction(async (tx) => {
    await tx.userBilling.upsert({
      where: {
        user_id: resolvedUserId,
      },
      create: {
        user_id: resolvedUserId,
        ...billingDetails,
      },
      update: billingDetails,
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
}

export async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error("Missing user id in checkout session metadata.");
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  if (!stripeSubscriptionId) {
    throw new Error("Missing subscription id in checkout session.");
  }

  // Stripe sends a checkout session here, so we load the full subscription first.
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  await updateSubscriptionStatus(subscription, {
    userId,
  });
}
