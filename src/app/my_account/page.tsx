import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SubscriptionCard } from "@/components/account/subscription-card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAccountSubscription } from "@/lib/billing";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Моят профил | Tipsrum",
  robots: { index: false, follow: false },
};

const PLAN_LABELS: Record<string, string> = {
  free: "Безплатен",
  premium: "Премиум",
};

export default async function MyAccountPage() {
  // The proxy only checks that a cookie exists; this is the real check.
  const session = await getSession();
  if (!session) redirect("/login?redirect=/my_account");

  const { user } = session;
  const subscription = await getAccountSubscription(user.id);
  const rows = [
    { label: "Имейл", value: user.email },
    {
      label: "План",
      value: PLAN_LABELS[user.entitlement ?? "free"] ?? user.entitlement,
    },
  ];

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-12">
      <Card className="h-fit w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Моят профил</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            {rows.map((row) => (
              <div
                key={row.label}
                className="border-border flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
        <CardFooter>
          <SignOutButton />
        </CardFooter>
      </Card>
      <SubscriptionCard
        isPremium={user.entitlement === "premium"}
        subscription={subscription}
      />
    </main>
  );
}
