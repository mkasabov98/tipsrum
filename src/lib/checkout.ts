import { stripe } from "@/lib/stripe";

/** How long after paying the success URL still counts as "just paid". */
const JUST_PAID_WINDOW_MS = 60 * 60 * 1000;

const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

/**
 * True only when `sessionId` is a completed, recent Stripe Checkout that this user
 * paid. The success URL can be typed by anyone, so the page asks Stripe rather than
 * trusting the query string. This decides which screen to show and nothing else:
 * access still comes only from the webhook.
 */
export async function isRecentCheckoutBy(
  sessionId: string | undefined,
  userId: string,
): Promise<boolean> {
  if (!sessionId || !CHECKOUT_SESSION_ID.test(sessionId)) return false;

  try {
    const checkout = await stripe().checkout.sessions.retrieve(sessionId);
    return (
      checkout.client_reference_id === userId &&
      checkout.status === "complete" &&
      Date.now() - checkout.created * 1000 < JUST_PAID_WINDOW_MS
    );
  } catch {
    // An unknown or foreign id is simply not a checkout of ours.
    return false;
  }
}
