import { Bot } from "grammy";

import {
  bindTelegram,
  consumeStartToken,
  findStartToken,
  grantChannelAccess,
  markInviteUsed,
  markLeftChannel,
  telegramConfig,
} from "@/lib/telegram";
import {
  alreadyMemberReply,
  errorReply,
  inviteKeyboard,
  inviteText,
  notPremiumReply,
  staleLinkReply,
  takenReply,
  welcomeReply,
} from "@/lib/telegram-copy";

/**
 * The premium bot. It replaces the old Make.com scenario: instead of asking for
 * an email and looking it up in a Google Sheet, it reads the personal token in
 * the START link the site gave the member, so the account is known for certain.
 * Used by the webhook route in production and by `pnpm telegram:poll` locally.
 */
export function createBot(): Bot {
  const config = telegramConfig();
  if (!config) throw new Error("Telegram is not configured");
  const bot = new Bot(config.token);

  // A failure must not reach Telegram as an error, or it redelivers the update
  // and the member gets a second, confusing reply.
  bot.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(`[telegram] update ${ctx.update.update_id} failed`, error);
      if (ctx.chat?.type === "private") {
        const { text, ...options } = errorReply();
        await ctx.reply(text, options).catch(() => {});
      }
    }
  });

  const dm = bot.chatType("private");

  dm.command("start", async (ctx) => {
    const token = ctx.match.trim();
    if (!token) {
      const { text, ...options } = welcomeReply();
      return void (await ctx.reply(text, options));
    }

    const userId = await findStartToken(token);
    if (!userId) {
      const { text, ...options } = staleLinkReply();
      return void (await ctx.reply(text, options));
    }

    if ((await bindTelegram(userId, ctx.from)) === "taken") {
      const { text, ...options } = takenReply();
      return void (await ctx.reply(text, options));
    }

    const access = await grantChannelAccess(userId);
    // Spent only after the work succeeded, so a failure can be retried with the
    // same button.
    await consumeStartToken(token);

    if (access.kind === "invite") {
      await ctx.reply(inviteText(), {
        reply_markup: inviteKeyboard(access.link),
      });
    } else if (access.kind === "member") {
      await ctx.reply(alreadyMemberReply().text);
    } else {
      const { text, ...options } = notPremiumReply();
      await ctx.reply(text, options);
    }
  });

  // Anything else - including an email typed out of habit from the old bot.
  // Typed emails are deliberately not accepted: anyone could type a paying
  // member's address.
  dm.on("message", async (ctx) => {
    const { text, ...options } = welcomeReply();
    await ctx.reply(text, options);
  });

  bot.on("chat_member", async (ctx) => {
    const update = ctx.chatMember;
    if (String(update.chat.id) !== config.chatId) return;
    const { status, user } = update.new_chat_member;
    if (status === "member") {
      await markInviteUsed(user.id, update.invite_link?.invite_link);
    } else if (status === "left" || status === "kicked") {
      await markLeftChannel(user.id);
    }
  });

  return bot;
}
