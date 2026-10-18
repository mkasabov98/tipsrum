import { webhookCallback } from "grammy";

import { createBot } from "@/lib/telegram-bot";

let handler: ((request: Request) => Promise<Response>) | undefined;

/**
 * Telegram webhook for the premium bot (production). Telegram sends the secret
 * set by `pnpm telegram:webhook set` in a header on every call, and grammY
 * rejects any request without it. Locally the bot long-polls instead.
 */
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[telegram] TELEGRAM_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  handler ??= webhookCallback(createBot(), "std/http", { secretToken: secret });
  return handler(request);
}
