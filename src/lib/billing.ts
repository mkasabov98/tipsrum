import { and, desc, eq, inArray, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import { syncTelegramAccess } from "@/lib/telegram";

/**
 * Provider statuses that keep premium access. `past_due` is included on purpose:
 * Stripe retries a failed renewal for a while, and a member should not lose the
 * channel over a card that is about to be retried. When the retries run out the
 * subscription moves to `canceled` or `unpaid`, and access goes then.
 */
export const PREMIUM_STATUSES = ["active", "trialing", "past_due"];

/** Checkouts that never completed - not worth showing on the account page. */
export const ABANDONED_STATUSES = ["incomplete", "incomplete_expired"];

export const GUARANTEE_DAYS = 30;

/**
 * Derives `user.entitlement` from the user's subscriptions. This is the only
 * place that writes it, and only webhook handlers call it, so premium can never
 * come from a browser redirect.
 */
export async function recomputeEntitlement(userId: string): Promise<void> {
  const [active] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, PREMIUM_STATUSES),
      ),
    )
    .limit(1);

  const [before] = await db
    .select({ entitlement: user.entitlement })
    .from(user)
    .where(eq(user.id, userId));
  const entitlement = active ? "premium" : "free";

  await db
    .update(user)
    .set({ entitlement, updatedAt: new Date() })
    .where(eq(user.id, userId));

  // Removal from the channel on lapse, a fresh invite on return. It throws on a
  // Telegram failure, so the webhook is retried until removal has happened.
  await syncTelegramAccess(
    userId,
    entitlement,
    entitlement === "premium" && before?.entitlement !== "premium",
  );
}

export type AccountSubscription = typeof subscriptions.$inferSelect;

/** The subscription the account page describes: the newest one that got paid. */
export async function getAccountSubscription(
  userId: string,
): Promise<AccountSubscription | undefined> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        notInArray(subscriptions.status, ABANDONED_STATUSES),
      ),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return row;
}
