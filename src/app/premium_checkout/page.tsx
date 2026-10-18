import type { Metadata } from "next";
import Link from "next/link";

import { startPremiumCheckout } from "@/app/my_account/actions";
import { ActionButton } from "@/components/account/action-button";
import { RegisterForm } from "@/components/auth/register-form";
import { AwaitPremium } from "@/components/checkout/await-premium";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GUARANTEE_DAYS } from "@/lib/billing";
import { isRecentCheckoutBy } from "@/lib/checkout";
import { getSession } from "@/lib/session";
import { SOCIAL } from "@/lib/site";
import { premiumBotLink } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Премиум абонамент | Tipsrum",
  robots: { index: false, follow: false },
};

const SELF = "/premium_checkout";

type SearchParams = Promise<{ session_id?: string; canceled?: string }>;

/**
 * One URL, several screens (spec 7a), chosen on the server from who is asking:
 * - guest: create an account first, then come back here to pay
 * - A, already premium: no pay button, so nobody is charged twice
 * - B, just paid and the webhook has granted premium: Telegram onboarding
 * - C, just paid but the webhook has not arrived yet: poll until it has
 * - free, not just paid: the offer and the pay button
 */
export default async function PremiumCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) {
    return (
      <Shell>
        <RegisterForm
          redirectTo={SELF}
          title="Премиум · 25 €/месец"
          description="Създай профил и продължи към плащането. Отнема по-малко от минута."
        />
      </Shell>
    );
  }

  const { user } = session;
  const { session_id: checkoutId, canceled } = await searchParams;
  const isPremium = user.entitlement === "premium";
  const justPaid = await isRecentCheckoutBy(checkoutId, user.id);

  if (isPremium) {
    const botLink = await premiumBotLink(user.id);
    return (
      <Shell>
        {justPaid ? (
          <PaymentSucceeded botLink={botLink} />
        ) : (
          <AlreadyPremium botLink={botLink} />
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      {justPaid ? (
        <PaymentProcessing />
      ) : (
        <PremiumOffer canceled={canceled !== undefined} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-md gap-6">{children}</div>
    </main>
  );
}

/** The member's personal START link; null only when the bot is not configured. */
type BotLink = string | null;

function BotButton({
  botLink,
  children,
}: {
  botLink: BotLink;
  children: React.ReactNode;
}) {
  if (!botLink) {
    return (
      <p className="text-sm" role="status">
        Telegram ботът временно не е достъпен. Пиши ни на <SupportLink /> и ще
        те добавим.
      </p>
    );
  }
  return (
    <a
      href={botLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
    >
      {children}
    </a>
  );
}

function SupportLink() {
  return (
    <a
      href={SOCIAL.telegram}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      @tipsrum_support
    </a>
  );
}

function BotFallback() {
  return (
    <p className="text-muted-foreground text-sm">
      Бутонът не работи? Увери се, че имаш инсталиран Telegram, и опитай пак.
      Ако пак не става, пиши ни на <SupportLink />.
    </p>
  );
}

/** State A. */
function AlreadyPremium({ botLink }: { botLink: BotLink }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Вече сте част от Премиум клуба!
        </CardTitle>
        <CardDescription>
          Няма нужда да плащате отново. Вашият абонамент е активен.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p>
          Ако още не си в Премиум канала, отвори бота и натисни START. Той ще те
          разпознае и ще ти изпрати личен линк за канала.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <BotButton botLink={botLink}>Към Telegram канала</BotButton>
        <Link href="/my_account" className="text-primary text-sm underline">
          Управление на абонамента
        </Link>
      </CardFooter>
    </Card>
  );
}

/** State B. */
function PaymentSucceeded({ botLink }: { botLink: BotLink }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Успешно плащане!</CardTitle>
        <CardDescription>Добре дошъл в премиум клуба.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid list-decimal gap-3 pl-5 text-sm">
          <li>Натисни бутона по-долу, за да отвориш нашия Telegram бот.</li>
          <li>Натисни START в долната част на чата.</li>
          <li>
            Ботът ще те разпознае и ще ти изпрати личен линк за Премиум канала.
            Линкът е валиден 24 часа и е само за теб.
          </li>
        </ol>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <BotButton botLink={botLink}>Отвори Telegram бот</BotButton>
        <BotFallback />
      </CardFooter>
    </Card>
  );
}

/** State C: paid, waiting for the webhook. Never asks the user to refresh. */
function PaymentProcessing() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Обработваме плащането…</CardTitle>
      </CardHeader>
      <CardContent>
        <AwaitPremium />
      </CardContent>
    </Card>
  );
}

/** Signed in, free, and not on the way back from a payment. */
function PremiumOffer({ canceled }: { canceled: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Премиум · 25 €/месец</CardTitle>
        <CardDescription>
          До 6 съвета на ден в затворената Telegram група. Отказваш се по всяко
          време, с {GUARANTEE_DAYS} дни гаранция за връщане на парите.
        </CardDescription>
      </CardHeader>
      {canceled && (
        <CardContent>
          <p className="text-sm" role="status">
            Плащането не беше завършено и не сме те таксували. Можеш да опиташ
            отново, когато решиш.
          </p>
        </CardContent>
      )}
      <CardFooter className="flex flex-col items-start gap-4">
        <form action={startPremiumCheckout} className="w-full sm:w-auto">
          <ActionButton pendingLabel="Пренасочване…">
            Продължи към плащане
          </ActionButton>
        </form>
        <Link href="/premium" className="text-primary text-sm underline">
          Повече за плана
        </Link>
      </CardFooter>
    </Card>
  );
}
