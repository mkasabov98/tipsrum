/**
 * Runs the premium bot locally by long-polling, so development needs no public
 * URL. Removes any webhook first: Telegram delivers to one or the other, never
 * both. Run it next to `pnpm dev`; stop with Ctrl+C.
 *
 *   pnpm telegram:poll
 */
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { createBot } = await import("../src/lib/telegram-bot");
  const { ALLOWED_UPDATES } = await import("../src/lib/telegram");

  const bot = createBot();
  bot.catch((error) => console.error("[telegram]", error.error));
  await bot.api.deleteWebhook();

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());

  await bot.start({
    allowed_updates: [...ALLOWED_UPDATES],
    onStart: (me) =>
      console.info(`Polling as @${me.username}. Ctrl+C to stop.`),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
