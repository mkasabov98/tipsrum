import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { PASSWORD_MIN_LENGTH, passwordProblem } from "@/lib/password";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const ONE_DAY = 60 * 60 * 24;

/** "martin@example.com" -> "martin". Only ever a display label. */
function displayNameFromEmail(email: string): string {
  return email.trim().split("@")[0] || email.trim();
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

        if (body.termsAccepted !== true) {
          throw new APIError("BAD_REQUEST", {
            code: "TERMS_NOT_ACCEPTED",
            message: "Terms and privacy policy must be accepted",
          });
        }
      }

      // Every route that sets a password goes through the same rules, so the
      // API cannot be used to set something weaker than the form allows.
      const PASSWORD_FIELD_BY_PATH: Record<string, string> = {
        "/sign-up/email": "password",
        "/reset-password": "newPassword",
        "/change-password": "newPassword",
      };
      const passwordField = PASSWORD_FIELD_BY_PATH[ctx.path];
      if (passwordField && ctx.body) {
        const value = (ctx.body as Record<string, unknown>)[passwordField];
        if (typeof value === "string") {
          const problem = passwordProblem(value);
          if (problem) {
            throw new APIError("BAD_REQUEST", {
              code: problem,
              message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and contain an upper-case letter, a lower-case letter, a digit and a symbol`,
            });
          }
        }
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              // Ignore whatever name the client sent: it is only a label, and
              // deriving it here keeps it consistent with the email.
              name: displayNameFromEmail(user.email),
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
