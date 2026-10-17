import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/stripe-billing";

/**
 * Stripe webhook endpoint - the only path by which premium is granted or taken
 * away. The signature check needs the raw body, so it is read as text before
 * anything parses it.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    // A 5xx makes Stripe retry with backoff; every handler is safe to replay.
    console.error(`[stripe] ${event.type} ${event.id} failed`, error);
    return new Response("Handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
