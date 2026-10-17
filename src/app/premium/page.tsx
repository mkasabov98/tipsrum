import { ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ComparisonTable } from "@/components/plans/comparison-table";
import { PlanResults } from "@/components/plans/plan-results";
import { PlanStats } from "@/components/plans/plan-stats";
import { CtaBand } from "@/components/site/cta-band";
import { Eyebrow, PageHero } from "@/components/site/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatEur } from "@/lib/format";
import {
  monthlyProfit,
  planTotals,
  profitCurve,
  recentBets,
} from "@/lib/results";
import { cn } from "@/lib/utils";

const TITLE = "Премиум абонамент";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
  description:
    "До 6 анализирани прогнози дневно, ексклузивна Premium група в Telegram и 30-дневна гаранция на парите за 25€ на месец.",
};

/** Targets, as promised on the plan - the actuals are in the results section. */
const TARGETS = [
  { value: "22%", label: "Целева месечна ROI", accent: true },
  { value: formatEur(420), label: "Очаквана месечна печалба" },
  { value: "до 6", label: "Стойностни прогнози на ден" },
];

export default async function PremiumPlanPage() {
  const [curve, monthly, bets, totals] = await Promise.all([
    profitCurve("premium"),
    monthlyProfit("premium"),
    recentBets("premium"),
    planTotals("premium"),
  ]);

  return (
    <main className="flex-1">
      <PageHero
        width="wide"
        eyebrow="Премиум абонамент · €25 / месец"
        title="Специално подбрани прогнози, само за Премиум членове."
        lead="По-голям обем, по-високи коефициенти и достъп до ексклузивната Premium група. С 30-дневна гаранция на парите."
        crumbs={[
          { href: "/", label: "Начало" },
          { href: "/planove", label: "Планове" },
          { href: "/premium", label: "Премиум" },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/premium_checkout"
            className={cn(buttonVariants(), "h-11 px-5")}
          >
            Към Премиум групата — 25€/месец →
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
        <Eyebrow>Разлика в плановете</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Какво получаваш над безплатния план
        </h2>
        <div className="mt-8">
          <ComparisonTable />
        </div>

        <div className="border-primary/30 bg-accent/50 mt-10 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="bg-primary text-primary-foreground grid size-11 shrink-0 place-items-center rounded-xl">
            <ShieldCheckIcon className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold">30-дневна гаранция на парите</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Ако през първите 30 дни не си доволен, връщаме сумата — без
              въпроси. Рискът е изцяло наш. Условията са описани в{" "}
              <Link
                href="/obshti-usloviya"
                className="text-primary underline-offset-4 hover:underline"
              >
                общите условия
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <PlanResults
        plan="premium"
        title="Сумирана печалба на Премиум"
        lead={`${totals.bets} записани залога от ${formatDate(totals.first)} до ${formatDate(totals.last)}, в ${totals.months} месеца, от които ${totals.winningMonths} печеливши. Залогът за статистиката е ${formatEur(20)} на прогноза. Губещите месеци също са тук — нищо не е скрито.`}
        curve={curve}
        monthly={monthly}
        bets={bets}
      />

      <CtaBand
        title="Присъедини се към Премиум"
        lead="25€ на месец. До 6 прогнози дневно, ексклузивна група и гаранция на парите."
        primary={{
          href: "/premium_checkout",
          label: "Стани Премиум — 25€/месец",
        }}
        secondary={{ href: "/kontakti", label: "Имам въпрос" }}
      />
    </main>
  );
}
