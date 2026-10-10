import { desc, eq, sql } from "drizzle-orm";
import {
  BadgeCheckIcon,
  CheckIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PlanCards } from "@/components/home/plan-cards";
import { DarkSection, Eyebrow } from "@/components/site/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { bets } from "@/db/schema";
import { formatEur, formatEurSigned, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tipsrum — конни прогнози, водени от данни",
  description:
    "Доказани конни прогнози за българския пазар. Прозрачни резултати, проследени месец по месец.",
};

const PREMIUM_TARGET_ROI = 22;

const VALUE_PROPS = [
  {
    icon: BadgeCheckIcon,
    title: "Безплатен старт",
    body: "Влез в Telegram групата и изпробвай услугата с реални прогнози — без задължения и без банкова карта.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Гаранция на парите",
    body: "С Премиум получаваш по-стойностни прогнози и 30-дневна гаранция — ако не си доволен, връщаме сумата.",
  },
  {
    icon: HeadphonesIcon,
    title: "Поддръжка 24/7",
    body: "Екипът ни е на разположение по всяко време за въпроси, свързани с прогнозите и абонамента.",
  },
];

const WINS = [1, 2, 3, 4, 5, 6, 7];

export default async function Home() {
  const [totals] = await db
    .select({
      profit: sql<string>`coalesce(sum(${bets.profit}), 0)`,
      months: sql<number>`count(distinct ${bets.month})`,
    })
    .from(bets);

  const monthly = await db
    .select({
      month: bets.month,
      profit: sql<string>`round(sum(${bets.profit}), 2)`,
      roi: sql<number>`round(sum(${bets.profit}) / nullif(sum(${bets.stake}), 0) * 100)`,
    })
    .from(bets)
    .where(eq(bets.plan, "premium"))
    .groupBy(bets.month)
    .orderBy(desc(bets.month))
    .limit(6);

  const stats = [
    { value: formatEur(totals.profit), label: "Обща проследена печалба" },
    { value: String(totals.months), label: "Проследени месеца" },
    {
      value: `${PREMIUM_TARGET_ROI}%`,
      label: "Целева месечна възвръщаемост",
      accent: true,
    },
  ];

  return (
    <main className="flex-1">
      {/* Hero. The design puts a racing photo behind this; nothing on the live
          site fits (show jumping and a casino table), so it runs on the
          gradient until a licensed racing photo exists. */}
      <section className="dark bg-background text-foreground relative overflow-hidden">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
          <Eyebrow>Прозрачни · Проследими · Доказани</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Конни прогнози, водени от{" "}
            <span className="text-brand-soft">данни.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-base sm:text-lg">
            Всяка препоръка е резултат от задълбочен анализ на стойностни
            коефициенти — не от предчувствие. Следи представянето ни месец по
            месец, напълно прозрачно.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants(), "h-11 px-5")}
            >
              Влез в безплатната група →
            </Link>
            <Link
              href="/rezultati"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 px-5",
              )}
            >
              Виж резултатите
            </Link>
          </div>
          <p className="text-muted-foreground mt-6 flex items-center gap-2 text-xs">
            <CheckIcon className="text-brand-soft size-4" aria-hidden />
            Без банкови данни за безплатния план · 30-дневна гаранция за Премиум
          </p>
        </div>

        {/* Stats band. Figures come from the bets table; the design's were
            placeholders. Its subscriber count is omitted - that number lives in
            Telegram, not in our data. */}
        <div className="border-border relative border-t">
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-1 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "border-border px-4 py-6 sm:px-6",
                  i > 0 && "border-t sm:border-t-0 sm:border-l",
                )}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span
                    className={cn(
                      "block text-3xl font-extrabold tracking-tight",
                      stat.accent && "text-mint",
                    )}
                  >
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <Eyebrow>Защо Tipsrum</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Не продаваме късмет. Продаваме анализ.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Екип от специалисти в конните надбягвания, които търсят стойност там,
          където букмейкърът е сгрешил цената.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="border-border bg-card rounded-xl border p-6"
            >
              <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg">
                <Icon className="size-4" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <DarkSection>
        <Eyebrow>Проследени резултати</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Сумирана печалба, месец по месец
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Реални данни от старта на всеки план. Печелившите и губещите месеци —
          всичко е тук.
        </p>
        <div className="border-border bg-card mt-8 overflow-hidden rounded-xl border">
          <ul>
            {monthly.map((row) => {
              const roi = Number(row.roi ?? 0);
              return (
                <li
                  key={row.month}
                  className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 last:border-0"
                >
                  <span className="font-mono text-sm">{row.month}</span>
                  <span className="flex items-center gap-5">
                    <span
                      className={cn(
                        "font-mono text-sm",
                        roi >= 0 ? "text-win" : "text-loss",
                      )}
                    >
                      {formatPercent(roi)}
                    </span>
                    <span className="w-24 text-right font-mono text-sm font-semibold">
                      {formatEurSigned(row.profit)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-5">
          <Link
            href="/rezultati"
            className="text-brand-soft text-sm underline-offset-4 hover:underline"
          >
            Покажи пълния регистър →
          </Link>
        </p>
      </DarkSection>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:py-20">
        <div className="flex justify-center">
          <Eyebrow>Планове</Eyebrow>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Избери нивото си на достъп
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
          Започни безплатно. Надгради, когато си готов за повече обем и
          по-високи коефициенти.
        </p>
        <div className="mt-10 text-left">
          <PlanCards />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:pb-20">
        <Eyebrow>Реални резултати</Eyebrow>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Без монтаж. Ето печалбите.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Скрийншоти директно от Telegram групата и от реални фишове.
        </p>
        <ul className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {WINS.map((n) => (
            <li key={n} className="snap-start">
              <Image
                src={`/screenshots/win-${n}.webp`}
                alt={`Скрийншот с печалба ${n}`}
                width={440}
                height={978}
                className="border-border h-80 w-auto rounded-xl border object-cover"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Готов ли си да залагаш по-умно?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm opacity-90">
            Присъедини се към безплатната група днес и виж какво означава
            прогноза, водена от данни.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="bg-card text-foreground hover:bg-card/90 inline-flex h-10 items-center rounded-lg px-5 text-sm font-medium transition-colors"
            >
              Започни безплатно
            </Link>
            <Link
              href="/kontakti"
              className="hover:bg-primary-foreground/10 inline-flex h-10 items-center rounded-lg border border-current/40 px-5 text-sm font-medium transition-colors"
            >
              Свържи се с нас
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
