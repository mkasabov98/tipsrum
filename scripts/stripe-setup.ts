/**
 * Creates the premium product and its €25/month price in the Stripe account
 * behind STRIPE_SECRET_KEY, tagged with the lookup key the app resolves at
 * checkout. Safe to re-run: an existing active price with that key is reported
 * and left alone.
 *
 *   pnpm stripe:setup
 */
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { PREMIUM_PRICE_LOOKUP_KEY, stripe } =
    await import("../src/lib/stripe");

  const existing = await stripe().prices.list({
    lookup_keys: [PREMIUM_PRICE_LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) {
    console.info(`Price already exists: ${existing.data[0].id}`);
    return;
  }

  const product = await stripe().products.create({
    name: "Tipsrum Премиум",
    description: "Месечен абонамент за премиум Telegram групата",
  });
  const price = await stripe().prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: 2500,
    recurring: { interval: "month" },
    lookup_key: PREMIUM_PRICE_LOOKUP_KEY,
  });
  console.info(`Created ${product.id} with price ${price.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
