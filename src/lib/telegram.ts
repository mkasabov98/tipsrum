import { randomBytes } from "node:crypto";

import { and, eq, gt, isNull, lte, ne, or } from "drizzle-orm";
import { Api, GrammyError } from "grammy";

import { db } from "@/db";
import { telegramLinks, user } from "@/db/schema";
import { inviteKeyboard, inviteText } from "@/lib/telegram-copy";

const HOUR_MS = 60 * 60 * 1000;

/** How long a personal START link from the site stays usable. */
const START_TOKEN_TTL_MS = 24 * HOUR_MS;

/** Channel invites work once and for a day (owners' call, 2026-10-18). */
const INVITE_TTL_MS = 24 * HOUR_MS;

/** Updates the bot asks Telegram for, in both webhook and polling mode. */
export const ALLOWED_UPDATES = [
  "message",
  "chat_member",
  "my_chat_member",
] as const;

type TelegramConfig = { token: string; username: string; chatId: string };

/**
 * All three are needed for anything Telegram-related to work. When they are
 * missing (a fresh dev checkout), pages hide the bot button and billing skips
 * the channel instead of failing.
 */
export function telegramConfig(): TelegramConfig | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const username = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
  const chatId = process.env.TELEGRAM_PREMIUM_CHAT_ID;
  if (!token || !username || !chatId) return null;
  return { token, username, chatId };
}

function requireConfig(): TelegramConfig {
  const config = telegramConfig();
  if (!config) {
    throw new Error(
      "Telegram is not configured: set TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME and TELEGRAM_PREMIUM_CHAT_ID",
    );
  }
  return config;
}

let client: Api | undefined;

/** Bot API client for calls made outside an update (webhooks, pages). */
export function telegramApi(): Api {
  client ??= new Api(requireConfig().token);
  return client;
}

/**
 * A 400 from Telegram is a definite "no" (the person is an admin, never existed,
 * the link is already dead) and retrying cannot change it. Anything else is
 * thrown so the caller - usually a Stripe webhook - is retried.
 */
function isPermanentRefusal(error: unknown): boolean {
  return error instanceof GrammyError && error.error_code === 400;
}

export type TelegramLink = typeof telegramLinks.$inferSelect;

export async function getTelegramLink(
  userId: string,
): Promise<TelegramLink | undefined> {
  const [row] = await db
    .select()
    .from(telegramLinks)
    .where(eq(telegramLinks.userId, userId))
    .limit(1);
  return row;
}

/**
 * The account's personal bot link, t.me/<bot>?start=<token>. Pressing START on
 * it tells the bot who this is, so nobody has to type an email. The token is
 * reused until it expires, so two open tabs show the same working link.
 */
export async function premiumBotLink(userId: string): Promise<string | null> {
  const config = telegramConfig();
  if (!config) return null;

  const now = new Date();
  const token = randomBytes(24).toString("base64url");
  const fresh = {
    startToken: token,
    startTokenExpiresAt: new Date(now.getTime() + START_TOKEN_TTL_MS),
    updatedAt: now,
  };

  // Only replaces a token that is missing or expired.
  const [issued] = await db
    .insert(telegramLinks)
    .values({ id: crypto.randomUUID(), userId, ...fresh })
    .onConflictDoUpdate({
      target: telegramLinks.userId,
      set: fresh,
      setWhere: or(
        isNull(telegramLinks.startToken),
        lte(telegramLinks.startTokenExpiresAt, now),
      ),
    })
    .returning({ startToken: telegramLinks.startToken });

  const current =
    issued?.startToken ?? (await getTelegramLink(userId))?.startToken;
  return `https://t.me/${config.username}?start=${current}`;
}

/** The account a still-valid START token belongs to. */
export async function findStartToken(token: string): Promise<string | null> {
  const [row] = await db
    .select({ userId: telegramLinks.userId })
    .from(telegramLinks)
    .where(
      and(
        eq(telegramLinks.startToken, token),
        gt(telegramLinks.startTokenExpiresAt, new Date()),
      ),
    )
    .limit(1);
  return row?.userId ?? null;
}

/** Spent once the bot has done its job, so a forwarded link is useless. */
export async function consumeStartToken(token: string): Promise<void> {
  await db
    .update(telegramLinks)
    .set({ startToken: null, startTokenExpiresAt: null, updatedAt: new Date() })
    .where(eq(telegramLinks.startToken, token));
}

/**
 * Binds a Telegram user to an account. A Telegram user already bound to a
 * different account is refused rather than moved: moving would let one paid
 * subscription be passed around between people.
 */
export async function bindTelegram(
  userId: string,
  from: { id: number; username?: string },
): Promise<"linked" | "taken"> {
  const telegramUserId = String(from.id);

  const [other] = await db
    .select({ id: telegramLinks.id })
    .from(telegramLinks)
    .where(
      and(
        eq(telegramLinks.telegramUserId, telegramUserId),
        ne(telegramLinks.userId, userId),
      ),
    )
    .limit(1);
  if (other) return "taken";

  const row = await getTelegramLink(userId);
  const previous = row?.telegramUserId;
  const switching = previous != null && previous !== telegramUserId;

  // The account moves to a new Telegram user: the old one leaves the channel.
  if (switching && row && hasChannelAccess(row)) {
    await closeChannelAccess(row);
  }

  try {
    await db
      .update(telegramLinks)
      .set({
        telegramUserId,
        telegramUsername: from.username ?? null,
        linkedAt: switching || !previous ? new Date() : row?.linkedAt,
        ...(switching
          ? { inviteStatus: "pending" as const, inviteLink: null }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(telegramLinks.userId, userId));
  } catch (error) {
    // Lost a race with another account binding the same Telegram user.
    if ((error as { code?: string }).code === "23505") return "taken";
    throw error;
  }
  return "linked";
}

/** True while this account may have a working invite or a seat in the channel. */
function hasChannelAccess(row: TelegramLink): boolean {
  return row.inviteStatus === "sent" || row.inviteStatus === "used";
}

const MEMBER_STATUSES = new Set(["creator", "administrator", "member"]);

export type ChannelAccess =
  | { kind: "invite"; link: string }
  | { kind: "member" }
  | { kind: "not_premium" }
  | { kind: "not_linked" };

/**
 * Gives a bound premium member a way into the channel: nothing if they are
 * already in it, otherwise a fresh personal invite. Any earlier invite is revoked
 * first, so at most one working link per account exists at a time.
 */
export async function grantChannelAccess(
  userId: string,
): Promise<ChannelAccess> {
  const { chatId } = requireConfig();

  const [account] = await db
    .select({ entitlement: user.entitlement })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (account?.entitlement !== "premium") return { kind: "not_premium" };

  const row = await getTelegramLink(userId);
  if (!row?.telegramUserId) return { kind: "not_linked" };

  const member = await telegramApi()
    .getChatMember(chatId, Number(row.telegramUserId))
    .catch((error: unknown) => {
      if (isPermanentRefusal(error)) return null;
      throw error;
    });
  if (member && MEMBER_STATUSES.has(member.status)) {
    await db
      .update(telegramLinks)
      .set({ inviteStatus: "used", updatedAt: new Date() })
      .where(eq(telegramLinks.id, row.id));
    return { kind: "member" };
  }

  if (row.inviteLink) await revokeInvite(row.inviteLink);

  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const invite = await telegramApi().createChatInviteLink(chatId, {
    // Shown to the owners in the channel's list of invite links.
    name: `tipsrum ${userId.slice(0, 20)}`,
    member_limit: 1,
    expire_date: Math.floor(expiresAt.getTime() / 1000),
  });

  await db
    .update(telegramLinks)
    .set({
      inviteLink: invite.invite_link,
      inviteStatus: "sent",
      inviteExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(telegramLinks.id, row.id));

  return { kind: "invite", link: invite.invite_link };
}

/** Called for chat_member updates: someone joined through our invite. */
export async function markInviteUsed(
  telegramUserId: number,
  inviteLink: string | undefined,
): Promise<void> {
  if (!inviteLink) return;
  await db
    .update(telegramLinks)
    .set({ inviteStatus: "used", updatedAt: new Date() })
    .where(
      and(
        eq(telegramLinks.telegramUserId, String(telegramUserId)),
        eq(telegramLinks.inviteLink, inviteLink),
      ),
    );
}

/**
 * Called for chat_member updates: the person left the channel themselves (or
 * was removed by hand). They keep their account link; the next bot START gives
 * them a fresh invite if they are still premium.
 */
export async function markLeftChannel(telegramUserId: number): Promise<void> {
  await db
    .update(telegramLinks)
    .set({ inviteStatus: "pending", inviteLink: null, updatedAt: new Date() })
    .where(
      and(
        eq(telegramLinks.telegramUserId, String(telegramUserId)),
        eq(telegramLinks.inviteStatus, "used"),
      ),
    );
}

async function revokeInvite(link: string): Promise<void> {
  try {
    await telegramApi().revokeChatInviteLink(requireConfig().chatId, link);
  } catch (error) {
    if (!isPermanentRefusal(error)) throw error;
  }
}

/**
 * Kills the outstanding invite and takes the person out of the channel. The
 * owners asked for removal, not a ban, so the ban is lifted at once: they can
 * come back with a new invite if they subscribe again.
 */
async function closeChannelAccess(row: TelegramLink): Promise<void> {
  const { chatId } = requireConfig();
  if (row.inviteLink) await revokeInvite(row.inviteLink);

  if (row.telegramUserId) {
    const id = Number(row.telegramUserId);
    try {
      await telegramApi().banChatMember(chatId, id);
      await telegramApi().unbanChatMember(chatId, id, { only_if_banned: true });
    } catch (error) {
      if (!isPermanentRefusal(error)) throw error;
      // e.g. the person is a channel admin; the owners have to do it by hand.
      console.warn(
        `[telegram] could not remove ${id} from the channel: ${(error as GrammyError).description}`,
      );
    }
  }

  await db
    .update(telegramLinks)
    .set({ inviteStatus: "revoked", inviteLink: null, updatedAt: new Date() })
    .where(eq(telegramLinks.id, row.id));
}

/**
 * Brings the channel in line with the account's entitlement. Billing calls this
 * after every entitlement write. Removal is driven by state, not by the change,
 * so if Telegram fails the webhook is retried and removal is attempted again.
 * Granting is a courtesy message and never fails the webhook.
 */
export async function syncTelegramAccess(
  userId: string,
  entitlement: "free" | "premium",
  becamePremium: boolean,
): Promise<void> {
  if (!telegramConfig()) {
    console.warn("[telegram] not configured; channel access left unchanged");
    return;
  }

  const row = await getTelegramLink(userId);
  if (!row?.telegramUserId) return;

  if (entitlement === "free") {
    if (hasChannelAccess(row)) await closeChannelAccess(row);
    return;
  }

  if (!becamePremium) return;
  // A returning member who already linked Telegram gets the invite straight away.
  try {
    const access = await grantChannelAccess(userId);
    if (access.kind === "invite") {
      await telegramApi().sendMessage(
        Number(row.telegramUserId),
        inviteText(),
        {
          reply_markup: inviteKeyboard(access.link),
        },
      );
    }
  } catch (error) {
    console.error(`[telegram] welcome-back invite for ${userId} failed`, error);
  }
}
