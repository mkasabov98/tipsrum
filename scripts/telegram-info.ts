/**
 * Shows which bot the token belongs to, where its updates go, and the chats it
 * has seen recently - which is how the private channel's ID is found: make the
 * bot an admin, post anything in the channel, then run this within a day.
 * With TELEGRAM_PREMIUM_CHAT_ID set it also checks the bot's rights there.
 * Read-only: it does not consume the pending updates.
 *
 *   pnpm telegram:info
 */
import { config } from "dotenv";
import { Api } from "grammy";
import type { Chat } from "grammy/types";

config({ path: ".env.local" });

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set in .env.local");
  const api = new Api(token);

  const me = await api.getMe();
  console.info(`Bot: @${me.username} (id ${me.id})`);

  const webhook = await api.getWebhookInfo();
  console.info(`Webhook: ${webhook.url || "none (polling)"}`);

  if (!webhook.url) {
    const chats = new Map<number, Chat>();
    for (const update of await api.getUpdates({
      allowed_updates: [
        "message",
        "channel_post",
        "my_chat_member",
        "chat_member",
      ],
    })) {
      // A channel post forwarded to the bot names its channel too.
      const origin = update.message?.forward_origin;
      const chat =
        update.channel_post?.chat ??
        update.my_chat_member?.chat ??
        update.chat_member?.chat ??
        (origin?.type === "channel" ? origin.chat : update.message?.chat);
      if (chat) chats.set(chat.id, chat);
    }
    console.info(chats.size ? "Recently seen chats:" : "No recent updates.");
    for (const chat of chats.values()) {
      const title = "title" in chat ? chat.title : "";
      console.info(`  ${chat.id}  ${chat.type}  ${title}`);
    }
  }

  const chatId = process.env.TELEGRAM_PREMIUM_CHAT_ID;
  if (chatId) {
    const chat = await api.getChat(chatId);
    const self = await api.getChatMember(chatId, me.id);
    console.info(
      `Premium chat: ${"title" in chat ? chat.title : chatId} (${chat.type})`,
    );
    console.info(`Bot status there: ${self.status}`);
    if (self.status === "administrator") {
      console.info(`  can_invite_users: ${self.can_invite_users}`);
      console.info(`  can_restrict_members: ${self.can_restrict_members}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
