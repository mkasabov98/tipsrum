/**
 * Points the bot at the deployed app (production), or takes it off again.
 * Uses BETTER_AUTH_URL as the public origin and TELEGRAM_WEBHOOK_SECRET as the
 * secret Telegram must send back, so run it with the production values loaded.
 *
 *   pnpm telegram:webhook set
 *   pnpm telegram:webhook delete
 */
import { config } from "dotenv";
import { Api } from "grammy";

config({ path: ".env.local" });

async function main() {
  const { ALLOWED_UPDATES } = await import("../src/lib/telegram");
  const { appOrigin } = await import("../src/lib/stripe");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  const api = new Api(token);

  const action = process.argv[2];
  if (action === "delete") {
    await api.deleteWebhook();
    console.info("Webhook removed; the bot can be polled again.");
    return;
  }
  if (action !== "set")
    throw new Error("Usage: pnpm telegram:webhook set|delete");

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not set");
  const url = `${appOrigin()}/api/telegram/webhook`;
  if (!url.startsWith("https://"))
    throw new Error(`Telegram needs https: ${url}`);

  await api.setWebhook(url, {
    secret_token: secret,
    allowed_updates: [...ALLOWED_UPDATES],
  });
  console.info(`Webhook set to ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
