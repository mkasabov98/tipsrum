import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import {
  GUARANTEE_DAYS,
  PREMIUM_STATUSES,
  recomputeEntitlement,
} from "@/lib/billing";
import { stripe } from "@/lib/stripe";

const DAY_MS = 24 * 60 * 60 * 1000;

function idOf(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Finds our user for a Stripe subscription. The customer mapping is
 * authoritative (it is saved before checkout starts); the metadata userId set at
 * checkout is the fallback.
 */
async function resolveUserId(sub: Stripe.Subscription): Promise<string | null> {
  const customerId = idOf(sub.customer);
  if (customerId) {
    const [owner] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.stripeCustomerId, customerId))
      .limit(1);
    if (owner) return owner.id;
  }
  return sub.metadata?.userId ?? null;
}

/**
 * Mirrors one Stripe subscription onto our `subscriptions` row and re-derives
 * the owner's entitlement. Callers pass a subscription freshly retrieved from the
 * API, never the event payload: Stripe does not guarantee event order, so the
 * payload of an older event can be staler than what is already stored.
 */
export async function syncStripeSubscription(
  sub: Stripe.Subscription,
): Promise<void> {
  const userId = await resolveUserId(sub);
  if (!userId) {
    console.warn(`[stripe] no user for subscription ${sub.id}; skipped`);
    return;
  }

  // Since API version 2025-03-31 the billing period lives on the items.
  const periodEnd = sub.items.data[0]?.current_period_end;
  const fields = {
    status: sub.status,
    providerCustomerId: idOf(sub.customer),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    // The portal can schedule a cancellation either way.
    cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at !== null,
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values({
      id: crypto.randomUUID(),
      userId,
      provider: "stripe",
      providerSubscriptionId: sub.id,
      // The guarantee runs from the first payment and is set once, on insert.
      refundEligibleUntil: new Date(
        sub.start_date * 1000 + GUARANTEE_DAYS * DAY_MS,
      ),
      ...fields,
    })
    .onConflictDoUpdate({
      target: [subscriptions.provider, subscriptions.providerSubscriptionId],
      set: fields,
    });

  await recomputeEntitlement(userId);
}

async function syncById(subscriptionId: string): Promise<void> {
  await syncStripeSubscription(
    await stripe().subscriptions.retrieve(subscriptionId),
  );
}

/**
 * A full refund means the owner has honoured the money-back guarantee (or
 * otherwise decided the member should go), so the subscription is cancelled
 * immediately rather than left to renew. A partial refund is a goodwill gesture
 * and leaves access alone.
 */
async function handleRefund(charge: Stripe.Charge): Promise<void> {
  if (!charge.refunded) return;
  const customerId = idOf(charge.customer);
  if (!customerId) return;

  const live = await db
    .select({ subscriptionId: subscriptions.providerSubscriptionId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.provider, "stripe"),
        eq(subscriptions.providerCustomerId, customerId),
        inArray(subscriptions.status, PREMIUM_STATUSES),
      ),
    );

  for (const { subscriptionId } of live) {
    await syncStripeSubscription(
      await stripe().subscriptions.cancel(subscriptionId),
    );
  }
}

/** Dispatches a verified webhook event. Every branch is safe to replay. */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const subscriptionId = idOf(event.data.object.subscription);
      if (subscriptionId) await syncById(subscriptionId);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncById(event.data.object.id);
      break;
    case "charge.refunded":
      await handleRefund(event.data.object);
      break;
    default:
      // Anything else the endpoint is subscribed to is acknowledged and ignored.
      break;
  }
}
