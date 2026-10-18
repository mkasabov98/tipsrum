import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { TELEGRAM } from "@/lib/site";
import type { TelegramLink } from "@/lib/telegram";
import { cn } from "@/lib/utils";

function channelStatus(link: TelegramLink): string {
  if (link.inviteStatus === "used") return "В канала";
  if (link.inviteStatus === "sent" && link.inviteExpiresAt) {
    return link.inviteExpiresAt > new Date()
      ? `Покана, валидна до ${formatDate(link.inviteExpiresAt)}`
      : "Поканата е изтекла";
  }
  return "Не е в канала";
}

function TelegramButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant?: "outline";
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant }), "w-full sm:w-auto")}
    >
      {children}
    </a>
  );
}

/**
 * Where the member's tips are. Free members get the open group directly;
 * premium members get their personal bot link, which also issues a fresh
 * channel invite whenever the last one has expired.
 */
export function TelegramCard({
  isPremium,
  botLink,
  link,
}: {
  isPremium: boolean;
  botLink: string | null;
  link: TelegramLink | undefined;
}) {
  if (!isPremium) {
    return (
      <Card className="h-fit w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Telegram</CardTitle>
          <CardDescription>
            Безплатните съвети са в нашата отворена Telegram група.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <TelegramButton href={TELEGRAM.freeGroup}>
            Влез в безплатната група
          </TelegramButton>
        </CardFooter>
      </Card>
    );
  }

  const linked = Boolean(link?.telegramUserId);
  const rows = link?.telegramUserId
    ? [
        {
          label: "Telegram",
          value: link.telegramUsername
            ? `@${link.telegramUsername}`
            : "Свързан",
        },
        { label: "Премиум канал", value: channelStatus(link) },
      ]
    : [];

  return (
    <Card className="h-fit w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Telegram</CardTitle>
        {!linked && (
          <CardDescription>
            Отвори бота и натисни START. Той ще разпознае профила ти и ще ти
            изпрати личен линк за Премиум канала.
          </CardDescription>
        )}
      </CardHeader>
      {linked && (
        <CardContent>
          <dl className="grid gap-3 text-sm">
            {rows.map((row) => (
              <div
                key={row.label}
                className="border-border flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
      <CardFooter>
        {botLink ? (
          <TelegramButton
            href={botLink}
            variant={linked ? "outline" : undefined}
          >
            {linked ? "Нов линк за канала" : "Отвори Telegram бот"}
          </TelegramButton>
        ) : (
          <p className="text-muted-foreground text-sm">
            Telegram ботът временно не е достъпен.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
