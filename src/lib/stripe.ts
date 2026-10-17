import Stripe from "stripe";

/**
 * The premium price is found by lookup key rather than a price id in an env var,
 * so test and live mode (and a price change) need no config edit: create the new
 * price with this key and "transfer" it. `pnpm stripe:setup` creates it in test mode.
 */
export const PREMIUM_PRICE_LOOKUP_KEY = "premium_monthly_eur";

let client: Stripe | undefined;

/** Lazily constructed so pages that never bill do not need the key to render. */
export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export async function premiumPriceId(): Promise<string> {
  const prices = await stripe().prices.list({
    lookup_keys: [PREMIUM_PRICE_LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) {
    throw new Error(
      `No active Stripe price with lookup key "${PREMIUM_PRICE_LOOKUP_KEY}". Run pnpm stripe:setup.`,
    );
  }
  return price.id;
}

/** Public origin for Stripe return URLs; the same value Better-Auth uses. */
export function appOrigin(): string {
  const origin = process.env.BETTER_AUTH_URL;
  if (!origin) throw new Error("BETTER_AUTH_URL is not set");
  return origin.replace(/\/$/, "");
}
