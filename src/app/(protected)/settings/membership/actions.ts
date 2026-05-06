"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";

export type DeleteAccountState = {
  error: string | null;
};

export type CancelMembershipState = {
  error: string | null;
  success: string | null;
};

const MAX_FEEDBACK_LENGTH = 500;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Reviewed
function formatMembershipEndDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.current_period_end ?? null;
}

export async function cancelPremiumMembership(
  currentState: CancelMembershipState,
): Promise<CancelMembershipState> {
  void currentState;

  if (!stripeSecretKey) {
    return {
      error: "Stripe is not configured yet.",
      success: null,
    };
  }

  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    return {
      error: "You must be logged in to manage membership.",
      success: null,
    };
  }

  const billing = await db.userBilling.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      stripe_subscription_id: true,
      access_expires_at: true,
      cancel_at_period_end: true,
    },
  });

  if (!billing || !billing?.stripe_subscription_id) {
    return {
      error:
        "No active Stripe subscription was found for this account. Please contact support.",
      success: null,
    };
  }

  if (billing.cancel_at_period_end) {
    return {
      error: null,
      success: billing.access_expires_at
        ? `Premium is already scheduled to cancel on ${formatMembershipEndDate(
            billing.access_expires_at,
          )}.`
        : "Premium is already scheduled to cancel at the end of the billing period.",
    };
  }
  try {
    const stripe = new Stripe(stripeSecretKey);

    const subscription = await stripe.subscriptions.update(
      billing.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      },
    );

    const subscriptionPeriodEnd = getSubscriptionPeriodEnd(subscription);
    const currentPeriodEndDate = subscriptionPeriodEnd
      ? new Date(subscriptionPeriodEnd * 1000)
      : null;

    await db.userBilling.update({
      where: {
        user_id: userId,
      },
      data: {
        subscription_status: subscription.status,
        access_expires_at: currentPeriodEndDate,
        cancel_at_period_end: subscription.cancel_at_period_end, // boolean - true if the subscription is set to cancel at the end of the period
      },
    });

    return {
      error: null,
      success: currentPeriodEndDate
        ? `Premium will stay active until ${formatMembershipEndDate(
            currentPeriodEndDate,
          )}.`
        : "Premium will stay active until the end of the current billing period.",
    };
  } catch (error) {
    console.log("Error canceling subscription:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to cancel premium membership right now.",
      success: null,
    };
  }
}

export async function deleteAccount(
  _currentState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const sessionResult = await requireSession();
  const user = sessionResult.session?.user;

  if (sessionResult.error || !user?.id || !user.email) {
    return {
      error: "You must be logged in to delete your account.",
    };
  }

  const password = formData.get("password");
  const feedback = formData.get("feedback");

  if (typeof password !== "string" || !password) {
    return {
      error: "Enter your password to delete your account.",
    };
  }

  if (typeof feedback === "string" && feedback.length > MAX_FEEDBACK_LENGTH) {
    return {
      error: "Feedback must be 500 characters or fewer.",
    };
  }

  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: {
        password,
      },
    });
  } catch {
    return {
      error: "Account deletion failed. Check your password and try again.",
    };
  }

  if (typeof feedback === "string" && feedback) {
    try {
      // Keep feedback storage separate so the deleted account is not restored by an insert error.
      await db.userCancelReason.create({
        data: {
          user_id: user.id,
          user_email: user.email,
          reason: feedback,
        },
      });
    } catch (error) {
      console.error("Failed to save cancellation feedback:", error);
    }
  }

  redirect("/login");
}
