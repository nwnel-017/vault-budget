import Stripe from "stripe";
import { auth } from "@/lib/auth";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const premiumMembershipRate = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
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

  try {
    // Create a hosted Stripe Checkout session for the premium subscription.
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [
        {
          price: premiumMembershipRate,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/settings/upgrade/success`,
      cancel_url: `${baseUrl}/settings/upgrade/failed`,
      metadata: {
        userId: session.user.id,
      },
    });

    return Response.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 500 },
    );
  }
}
