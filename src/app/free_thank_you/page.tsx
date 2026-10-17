import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { TELEGRAM } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Добре дошъл | Tipsrum",
  robots: { index: false, follow: false },
};

/**
 * Where a free sign-up lands (spec 6). The free group is open, so there is no bot
 * and no verification: the group link is simply handed over, with a premium upsell.
 */
export default async function FreeThankYouPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/free_thank_you");

  const isPremium = session.user.entitlement === "premium";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">🎉 Ти си вътре!</CardTitle>
          <CardDescription>
            Твоят безплатен акаунт е активиран успешно.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          Безплатните прогнози излизат в нашата Telegram група. Влез, за да не
          пропуснеш следващата.
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <a
            href={TELEGRAM.freeGroup}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Влез в Telegram групата
          </a>
          {!isPremium && (
            <p className="text-muted-foreground text-sm">
              Готов ли си да печелиш повече?{" "}
              <Link href="/premium_checkout" className="text-primary underline">
                Вземи Премиум сега
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
