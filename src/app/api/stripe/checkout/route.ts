import Stripe from "stripe";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const premiumMembershipRate = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL;
}

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return Response.json(
      { error: "Missing Stripe secret key." },
      { status: 500 },
    );
  }

  if (!premiumMembershipRate) {
    return Response.json(
      { error: "Missing premium membership price id." },
      { status: 500 },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const baseUrl = getBaseUrl(request);

  if (!baseUrl) {
    return Response.json({ error: "App url was not found" }, { status: 500 });
  }

  try {
    const userBilling = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        accountTier: true,
        billing: {
          select: {
            stripe_subscription_id: true,
            subscription_status: true,
            access_expires_at: true,
          },
        },
      },
    });

    const hasPremiumAccess =
      userBilling?.accountTier === "PREMIUM" ||
      (userBilling?.billing?.access_expires_at !== null &&
        userBilling?.billing?.access_expires_at !== undefined &&
        userBilling?.billing.access_expires_at > new Date());

    const hasExistingStripeSubscription =
      Boolean(userBilling?.billing?.stripe_subscription_id) &&
      userBilling?.billing?.subscription_status !== "canceled" &&
      userBilling?.billing?.subscription_status !== "unpaid";

    if (hasPremiumAccess || hasExistingStripeSubscription) {
      return Response.json(
        { error: "This account already has premium membership." },
        { status: 409 },
      );
    }
  } catch (error) {
    console.log("Failed to lookup users current billing info: " + error);
    return Response.json(
      { error: "Failed to lookup users current billing info." },
      { status: 400 },
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [
        {
          price: premiumMembershipRate,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payments/success`,
      cancel_url: `${baseUrl}/payments/fail`,
      metadata: {
        userId: session.user.id,
      },
    });

    return Response.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.log("Failed to create checkout session: " + error);
    return Response.json(
      {
        error: "Unable to create checkout session.",
      },
      { status: 500 },
    );
  }
}
