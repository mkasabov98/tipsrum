"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/session";
import { appOrigin, premiumPriceId, stripe } from "@/lib/stripe";

async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/my_account");
  return session.user;
}

/** Returns the account's Stripe customer, creating and saving it on first use. */
async function ensureStripeCustomer(account: {
  id: string;
  email: string;
}): Promise<string> {
  const [row] = await db
    .select({ customerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, account.id));
  if (row?.customerId) return row.customerId;

  const customer = await stripe().customers.create({
    email: account.email,
    metadata: { userId: account.id },
  });

  // Only fills an empty slot, so a double click cannot swap the customer under a
  // checkout that is already open; the loser's customer is simply never used.
  const [saved] = await db
    .update(user)
    .set({ stripeCustomerId: customer.id })
    .where(and(eq(user.id, account.id), isNull(user.stripeCustomerId)))
    .returning({ customerId: user.stripeCustomerId });
  if (saved?.customerId) return saved.customerId;

  const [existing] = await db
    .select({ customerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, account.id));
  return existing!.customerId!;
}

export async function startPremiumCheckout(): Promise<void> {
  const account = await requireUser();

  // An active member must never be able to pay a second time.
  if (account.entitlement === "premium") redirect("/my_account");

  const customer = await ensureStripeCustomer(account);

  // A checkout left open in another tab could otherwise be paid as well,
  // creating a second subscription. Only the newest one stays payable.
  const open = await stripe().checkout.sessions.list({
    customer,
    status: "open",
    limit: 10,
  });
  for (const stale of open.data) {
    await stripe().checkout.sessions.expire(stale.id);
  }

  const origin = appOrigin();
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: account.id,
    line_items: [{ price: await premiumPriceId(), quantity: 1 }],
    subscription_data: { metadata: { userId: account.id } },
    locale: "bg",
    // The redirect only says "we are processing"; the webhook grants access.
    success_url: `${origin}/my_account?checkout=success`,
    cancel_url: `${origin}/my_account`,
  });

  if (!checkout.url) throw new Error("Stripe returned no checkout URL");
  redirect(checkout.url);
}

export async function openBillingPortal(): Promise<void> {
  const account = await requireUser();

  const [row] = await db
    .select({ customerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, account.id));
  if (!row?.customerId) redirect("/my_account");

  const portal = await stripe().billingPortal.sessions.create({
    customer: row.customerId,
    return_url: `${appOrigin()}/my_account`,
  });
  redirect(portal.url);
}
