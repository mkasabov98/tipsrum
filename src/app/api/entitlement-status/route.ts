import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

// Polled by the checkout page while the Stripe webhook catches up, so it must
// always read the database, never a cached answer.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "unauthenticated" },
      { status: 401, headers: NO_STORE },
    );
  }
  return NextResponse.json(
    { entitlement: session.user.entitlement ?? "free" },
    { headers: NO_STORE },
  );
}
