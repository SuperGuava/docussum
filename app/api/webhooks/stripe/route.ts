import { headers } from "next/headers";
import type Stripe from "stripe";

import { fulfillCheckoutSession } from "@/lib/stripe/fulfill-checkout";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook] signature failed:", message);
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const outcome = await fulfillCheckoutSession(session, event.id);

      if (!outcome.ok) {
        console.error("[stripe webhook] skipped charge", {
          eventId: event.id,
          sessionId: session.id,
          reason: outcome.reason,
        });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "handler error";
    console.error("[stripe webhook] handler error:", message, err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
