import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const planEnum = pgEnum("plan", ["free", "premium"]);
export const betResultEnum = pgEnum("bet_result", [
  "WON",
  "PLACED",
  "Lost",
  "Void",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paypal",
]);
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "sent",
  "used",
  "expired",
  "revoked",
]);

/* -------------------------------------------------------------------------- */
/* Better-Auth owned tables                                                   */
/* Shape is dictated by Better-Auth's adapter; custom columns are appended to  */
/* `user` and mirrored in the additionalFields config in src/lib/auth.ts.      */
/* -------------------------------------------------------------------------- */

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    // Custom fields (Phase 1 of the build plan).
    username: text("username"),
    // Never written from registration input - only by billing webhooks (Phase 5).
    entitlement: text("entitlement").notNull().default("free"),
    termsAcceptedAt: timestamp("terms_accepted_at"),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  },
  (t) => [
    // Case-insensitive, matching WordPress: "Martin" and "martin" are the same user.
    uniqueIndex("user_username_lower_idx").on(sql`lower(${t.username})`),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    // Who vouches for the identity: "credential" for email/password, the OAuth
    // provider otherwise. Required by Better-Auth 1.7.
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("account_issuer_account_id_idx").on(t.issuer, t.accountId),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* -------------------------------------------------------------------------- */
/* Billing (Phase 5)                                                          */
/* -------------------------------------------------------------------------- */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    // Stripe customer id / PayPal payer id.
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id").notNull(),
    // Provider status verbatim (active, past_due, canceled, ...). Webhook
    // handlers are the only writers.
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    // 30-day money-back guarantee window (spec section 7).
    refundEligibleUntil: timestamp("refund_eligible_until"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("subscriptions_provider_sub_id_idx").on(
      t.provider,
      t.providerSubscriptionId,
    ),
    index("subscriptions_user_id_idx").on(t.userId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Telegram (Phase 7)                                                         */
/* -------------------------------------------------------------------------- */

export const telegramLinks = pgTable(
  "telegram_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Populated once the user actually starts the bot.
    telegramUserId: text("telegram_user_id").unique(),
    // Signed one-time deep-link token issued at checkout success.
    inviteToken: text("invite_token").unique(),
    inviteStatus: inviteStatusEnum("invite_status")
      .notNull()
      .default("pending"),
    inviteExpiresAt: timestamp("invite_expires_at"),
    linkedAt: timestamp("linked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("telegram_links_user_id_idx").on(t.userId)],
);

/* -------------------------------------------------------------------------- */
/* Results (Phase 4 reads, Phase 10 writes)                                   */
/* Monthly summary / ROI / cumulative / drawdown are DERIVED from these rows;  */
/* there is deliberately no summary table (spec section 9).                    */
/* -------------------------------------------------------------------------- */

export const bets = pgTable(
  "bets",
  {
    id: text("id").primaryKey(),
    plan: planEnum("plan").notNull(),
    date: date("date").notNull(),
    time: time("time"),
    course: text("course").notNull(),
    race: text("race"),
    horse: text("horse").notNull(),
    odds: numeric("odds", { precision: 8, scale: 2 }),
    result: betResultEnum("result").notNull(),
    stake: numeric("stake", { precision: 10, scale: 2 }).notNull(),
    profit: numeric("profit", { precision: 10, scale: 2 }).notNull(),
    // Denormalised YYYY-MM label - grouping key for the monthly summary.
    month: text("month").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // Natural key for Phase 10's idempotent sheet-sync upsert.
    uniqueIndex("bets_natural_key_idx").on(
      t.plan,
      t.date,
      t.course,
      t.race,
      t.horse,
    ),
    index("bets_plan_date_idx").on(t.plan, t.date),
    index("bets_plan_month_idx").on(t.plan, t.month),
  ],
);

/* -------------------------------------------------------------------------- */
/* Content (Phase 9)                                                          */
/* -------------------------------------------------------------------------- */

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    // Markdown, edited through the owner-only admin.
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("posts_published_at_idx").on(t.publishedAt)],
);

/* -------------------------------------------------------------------------- */
/* Contact form (Phase 3)                                                     */
/* -------------------------------------------------------------------------- */

export const contactSubmissions = pgTable("contact_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
