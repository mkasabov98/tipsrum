import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Phase 2 wires the Brevo transactional send for this.
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
      },
      // input: false is load-bearing - it stops a client from setting its own
      // entitlement at registration. Premium is granted only by the Phase 5
      // billing webhooks.
      entitlement: {
        type: 'string',
        required: false,
        defaultValue: 'free',
        input: false,
      },
      termsAcceptedAt: {
        type: 'date',
        required: false,
      },
      marketingOptIn: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
});
