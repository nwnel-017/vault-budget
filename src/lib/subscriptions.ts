import Stripe from "stripe";
import db from "@/lib/prisma";

const premiumMembershipPriceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

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

type SubscriptionSyncResult =
  | {
      status: "applied";
    }
  | {
      status: "ignored";
      reason: string;
    };

function shouldUseFreeTier(subscription: Stripe.Subscription) {
  return subscription.status !== "active" && subscription.status !== "trialing";
}

function isSameBillingState(
  currentBilling: {
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    subscription_status: string | null;
    access_expires_at: Date | null;
    cancel_at_period_end: boolean;
  } | null,
  nextBilling: ReturnType<typeof getBillingDetails>,
) {
  if (!currentBilling) {
    return false;
  }

  const currentExpiryTime = currentBilling.access_expires_at?.getTime() ?? null;
  const nextExpiryTime = nextBilling.access_expires_at?.getTime() ?? null;

  return (
    currentBilling.stripe_customer_id === nextBilling.stripe_customer_id &&
    currentBilling.stripe_subscription_id ===
      nextBilling.stripe_subscription_id &&
    currentBilling.stripe_price_id === nextBilling.stripe_price_id &&
    currentBilling.subscription_status === nextBilling.subscription_status &&
    currentBilling.cancel_at_period_end === nextBilling.cancel_at_period_end &&
    currentExpiryTime === nextExpiryTime
  );
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

export async function updateSubscriptionStatus(
  subscription: Stripe.Subscription,
  options?: {
    userId?: string;
  },
): Promise<SubscriptionSyncResult> {
  let resolvedUserId: string | null;

  if (options?.userId) {
    resolvedUserId = options.userId;
  } else {
    resolvedUserId = await getUserId(subscription);
  }
  if (!resolvedUserId) {
    return {
      status: "ignored",
      reason: "No matching user was found for this Stripe subscription.",
    };
  }

  const billingDetails = getBillingDetails(subscription);
  const nextAccountTier = shouldUseFreeTier(subscription) ? "FREE" : "PREMIUM";
  const existingUser = await db.user.findUnique({
    where: {
      id: resolvedUserId,
    },
    select: {
      accountTier: true,
      billing: {
        select: {
          stripe_customer_id: true,
          stripe_subscription_id: true,
          stripe_price_id: true,
          subscription_status: true,
          access_expires_at: true,
          cancel_at_period_end: true,
        },
      },
    },
  });

  if (!existingUser) {
    return {
      status: "ignored",
      reason: "User was not found for this Stripe subscription.",
    };
  }

  if (
    existingUser.accountTier === nextAccountTier &&
    isSameBillingState(existingUser.billing, billingDetails)
  ) {
    return {
      status: "ignored",
      reason: "Subscription state was already up to date.",
    };
  }

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
        accountTier: nextAccountTier,
      },
    });
  });

  return {
    status: "applied",
  };
}

export async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<SubscriptionSyncResult> {
  if (session.mode !== "subscription") {
    return {
      status: "ignored",
      reason: "Checkout session was not a subscription checkout.",
    };
  }

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

  if (!premiumMembershipPriceId) {
    throw new Error("Missing premium membership price id.");
  }

  if (getSubscriptionPriceId(subscription) !== premiumMembershipPriceId) {
    return {
      status: "ignored",
      reason: "Checkout session did not match the premium membership price.",
    };
  }

  return updateSubscriptionStatus(subscription, {
    userId,
  });
}
