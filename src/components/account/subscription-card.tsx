import Link from "next/link";

import {
  openBillingPortal,
  startPremiumCheckout,
} from "@/app/my_account/actions";
import { ActionButton } from "@/components/account/action-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AccountSubscription } from "@/lib/billing";
import { formatDate } from "@/lib/format";

type Row = { label: string; value: string };

function describe(sub: AccountSubscription, isPremium: boolean): Row[] {
  const periodEnd = formatDate(sub.currentPeriodEnd);

  if (!isPremium) return [{ label: "Статус", value: "Прекратен" }];

  const rows: Row[] =
    sub.status === "past_due"
      ? [
          { label: "Статус", value: "Неуспешно плащане" },
          { label: "Следващ опит", value: "автоматично през следващите дни" },
        ]
      : sub.cancelAtPeriodEnd
        ? [
            { label: "Статус", value: "Няма да се поднови" },
            { label: "Достъп до", value: periodEnd },
          ]
        : [
            { label: "Статус", value: "Активен" },
            { label: "Следващо плащане", value: `${periodEnd} · 25 €` },
          ];

  if (sub.refundEligibleUntil && sub.refundEligibleUntil > new Date()) {
    rows.push({
      label: "Гаранция",
      value: `пари обратно до ${formatDate(sub.refundEligibleUntil)}`,
    });
  }
  return rows;
}

export function SubscriptionCard({
  isPremium,
  subscription,
}: {
  isPremium: boolean;
  subscription: AccountSubscription | undefined;
}) {
  return (
    <Card className="h-fit w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Абонамент</CardTitle>
        {!subscription && (
          <CardDescription>
            Премиум планът носи до 6 съвета на ден в затворената Telegram група.
            25 € на месец, с 30 дни гаранция за връщане на парите.
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {subscription && (
          <dl className="grid gap-3 text-sm">
            {describe(subscription, isPremium).map((row) => (
              <div
                key={row.label}
                className="border-border flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {isPremium && subscription?.status === "past_due" && (
          <p className="text-muted-foreground mt-4 text-sm">
            Банката отказа последното плащане. Обнови картата си, за да не
            загубиш достъпа до групата.
          </p>
        )}
        {isPremium &&
          subscription?.refundEligibleUntil &&
          subscription.refundEligibleUntil > new Date() && (
            <p className="text-muted-foreground mt-4 text-sm">
              Ако премиум не е за теб, пиши ни през{" "}
              <Link href="/kontakti" className="text-primary underline">
                страницата за контакти
              </Link>{" "}
              и ще върнем парите.
            </p>
          )}
      </CardContent>

      <CardFooter>
        {isPremium ? (
          <form action={openBillingPortal} className="w-full sm:w-auto">
            <ActionButton variant="outline" pendingLabel="Отваряне…">
              Управление на абонамента
            </ActionButton>
          </form>
        ) : (
          <form action={startPremiumCheckout} className="w-full sm:w-auto">
            <ActionButton pendingLabel="Пренасочване…">
              Стани Премиум · 25 €/месец
            </ActionButton>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}
