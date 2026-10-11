import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PlanResults } from "@/components/plans/plan-results";
import { PlanStats } from "@/components/plans/plan-stats";
import { CtaBand } from "@/components/site/cta-band";
import { Eyebrow, PageHero } from "@/components/site/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatEur } from "@/lib/format";
import { monthlyProfit, planTotals, recentBets } from "@/lib/results";
import { cn } from "@/lib/utils";

const TITLE = "Безплатен план";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
  description:
    "До 3 анализирани прогнози дневно в Telegram, без банкови данни и без ангажимент. Виж резултатите на безплатния план.",
};

/** Targets, as promised on the plan - the actuals are in the results section. */
const TARGETS = [
  { value: "14%", label: "Целева месечна ROI", accent: true },
  { value: formatEur(280), label: "Очаквана месечна печалба" },
  { value: "до 3", label: "Стойностни прогнози на ден" },
];

const STEPS = [
  {
    title: "Регистрирай се",
    body: "Нужен е само имейл. Отнема по-малко от 30 секунди и не искаме банкови данни.",
  },
  {
    title: "Влез в групата",
    body: "Получаваш достъп до безплатния Telegram канал, където публикуваме прогнозите.",
  },
  {
    title: "Следи резултата",
    body: "Всяка прогноза се отчита в публичния регистър — и печалбите, и загубите.",
  },
];

export default async function FreePlanPage() {
  const [monthly, bets, totals] = await Promise.all([
    monthlyProfit("free"),
    recentBets("free"),
    planTotals("free"),
  ]);

  return (
    <main className="flex-1">
      <PageHero
        width="wide"
        eyebrow="Безплатен план · €0"
        title="Изпробвай услугата без никакъв риск."
        lead="До 3 внимателно анализирани прогнози дневно, директно в Telegram. Без банкови данни, без ангажимент — просто влез и следи."
        crumbs={[
          { href: "/", label: "Начало" },
          { href: "/planove", label: "Планове" },
          { href: "/free", label: "Безплатен" },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className={cn(buttonVariants(), "h-11 px-5")}>
            Влез в Telegram групата →
          </Link>
          <Link
            href="/rezultati"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
          >
            Виж резултатите
          </Link>
        </div>
        <PlanStats stats={TARGETS} />
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <Eyebrow>Как работи</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Три стъпки до първата прогноза
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="border-border bg-card rounded-xl border p-6"
            >
              <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg font-mono text-sm font-semibold">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Ported from the live plan page, trimmed to the claims we can stand
            behind and converted to euro. */}
        <div className="border-border bg-card mt-10 rounded-xl border p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Какво получаваш</h3>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Безплатният абонамент ви дава идеален старт: средно{" "}
            <strong className="text-foreground">
              3 анализирани прогнози на ден
            </strong>
            , базирани на доказани стратегии, с прогнозна печалба от{" "}
            <strong className="text-foreground">
              {formatEur(280)} месечно
            </strong>{" "}
            при целева месечна възвръщаемост от{" "}
            <strong className="text-foreground">14%</strong>. Можете да
            започнете дори с малка банка от {formatEur(100)}. Включен е и достъп
            до нашата Telegram група, където ще откриете съвети и обратна връзка
            от екипа.
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            <Link
              href="/planove"
              className="text-primary inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
            >
              Сравни с Премиум
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </p>
        </div>
      </section>

      <PlanResults
        title="Сумирана печалба на безплатния план"
        lead={`${totals.bets} записани залога от ${formatDate(totals.first)} до ${formatDate(totals.last)}, в ${totals.months} месеца, от които ${totals.winningMonths} печеливши. Залогът за статистиката е ${formatEur(20)} на прогноза. Имаме и губещи месеци — показваме ги, защото нямаме какво да крием.`}
        monthly={monthly}
        bets={bets}
      />

      <CtaBand
        title="Искаш още повече стойност?"
        lead="Премиум дава до 6 прогнози дневно, по-стойностни коефициенти, ексклузивна група и 30-дневна гаранция на парите."
        primary={{ href: "/premium", label: "Виж Премиум абонамента →" }}
        secondary={{ href: "/register", label: "Остани в безплатния" }}
      />
    </main>
  );
}
