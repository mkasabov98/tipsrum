import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * The WordPress free-plan URL, still linked from old posts and ads. The free plan
 * is just an account, so guests go to sign-up and members to the welcome page.
 */
export default async function FreeCheckoutPage() {
  redirect((await getSession()) ? "/free_thank_you" : "/register");
}
