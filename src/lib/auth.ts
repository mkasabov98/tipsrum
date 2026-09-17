import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { isValidUsername } from "@/lib/username";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const ONE_DAY = 60 * 60 * 24;

async function isUsernameTaken(username: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(sql`lower(${schema.user.username}) = lower(${username})`)
    .limit(1);
  return rows.length > 0;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // Spec section 6: free signups have no email verification step.
    requireEmailVerification: false,
    // A reset usually means the password may be compromised, so sign out everywhere.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Нова парола за Tipsrum",
        text: [
          `Здравей, ${user.name}!`,
          "",
          "Получихме заявка за нова парола за профила ти в Tipsrum.",
          "Отвори линка, за да зададеш нова парола:",
          "",
          url,
          "",
          "Линкът е валиден 1 час. Ако заявката не е от теб, просто игнорирай този имейл.",
        ].join("\n"),
      });
    },
  },

  session: {
    // "Remember me" sessions last 30 days and slide forward once a day of activity.
    // Unticking "remember me" gives a browser-session cookie instead.
    expiresIn: THIRTY_DAYS,
    updateAge: ONE_DAY,
  },

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
      },
      // input: false is load-bearing - it stops a client from setting its own
      // entitlement at registration. Premium is granted only by the Phase 5
      // billing webhooks.
      entitlement: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      // Stamped by the server when the terms checkbox is accepted; never client input.
      termsAcceptedAt: {
        type: "date",
        required: false,
        input: false,
      },
      marketingOptIn: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as Record<string, unknown>;
        const username =
          typeof body.username === "string" ? body.username.trim() : "";

        if (body.termsAccepted !== true) {
          throw new APIError("BAD_REQUEST", {
            code: "TERMS_NOT_ACCEPTED",
            message: "Terms and privacy policy must be accepted",
          });
        }
        if (!isValidUsername(username)) {
          throw new APIError("BAD_REQUEST", {
            code: "INVALID_USERNAME",
            message: "Username is invalid",
          });
        }
        // Friendly error for the common case; the lower(username) unique index is
        // still the real guarantee against two simultaneous signups.
        if (await isUsernameTaken(username)) {
          throw new APIError("BAD_REQUEST", {
            code: "USERNAME_TAKEN",
            message: "Username is already taken",
          });
        }
      }

      // The spec has no username change, and allowing it here would bypass the
      // validation above.
      if (ctx.path === "/update-user" && ctx.body && "username" in ctx.body) {
        throw new APIError("BAD_REQUEST", {
          code: "USERNAME_CHANGE_NOT_ALLOWED",
          message: "Username cannot be changed",
        });
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const username = (user as { username?: string }).username?.trim();
          return {
            data: {
              ...user,
              username,
              // The spec never asks for a display name; Better-Auth requires one.
              name: username ?? user.name,
              termsAcceptedAt: new Date(),
            },
          };
        },
      },
    },
  },

  // Must stay last: lets server actions set auth cookies through next/headers.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
