import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BetRegister } from "@/components/results/bet-register";
import { RoiNote } from "@/components/results/monthly-profit";
import { MonthlySummary } from "@/components/results/monthly-summary";
import { ProfitChart } from "@/components/results/profit-chart";
import { ResultsStats } from "@/components/results/results-stats";
import {
  Pagination,
  RowsPicker,
  TableFooter,
} from "@/components/results/table-controls";
import { DarkSection, Eyebrow, PageHero } from "@/components/site/page-shell";
import { formatDate } from "@/lib/format";
import {
  betRegister,
  currentMonth,
  maxDrawdown,
  monthlySummary,
  PLAN_LABELS,
  PLANS,
  planTotals,
  profitCurve,
} from "@/lib/results";
import {
  MONTH_ROWS,
  parseResultsQuery,
  resultsHref,
} from "@/lib/results-query";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Резултати | Tipsrum",
  description:
    "Пълен публичен регистър на прогнозите ни — всеки залог, печалба и загуба, месец по месец, за Премиум и Безплатния план.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = parseResultsQuery(await searchParams);
  const { plan } = query;

  const [totals, drawdown, curve, months, register] = await Promise.all([
    planTotals(plan),
    maxDrawdown(plan),
    profitCurve(plan),
    monthlySummary(plan),
    betRegister(query),
  ]);
  // The monthly summary is a few dozen rows at most, so it is fetched whole
  // (the register's month filter needs every month anyway) and paged here.
  const monthPages = Math.max(1, Math.ceil(months.length / query.mrows));

  // A stale link past the last page (the data shrank, or a filter changed)
  // lands on the last real page instead of an empty table.
  if (register.total > 0 && query.page > register.pages) {
    redirect(resultsHref({ ...query, page: register.pages }, "register"));
  }
  if (query.mpage > monthPages) {
    redirect(resultsHref({ ...query, mpage: monthPages }, "months"));
  }
  const monthRows = months.slice(
    (query.mpage - 1) * query.mrows,
    query.mpage * query.mrows,
  );
  const current = currentMonth();

  return (
    <main className="flex-1">
      <PageHero
        width="wide"
        eyebrow="Резултати"
        title="Всеки залог, публично."
        lead="Пълният ни регистър — печалбите и загубите, без пропуски. Всичко по-долу е изчислено директно от записаните залози."
        crumbs={[
          { href: "/", label: "Начало" },
          { href: "/rezultati", label: "Резултати" },
        ]}
      >
        <nav aria-label="План" className="mt-8 flex gap-2">
          {PLANS.map((p) => (
            <Link
              key={p}
              href={resultsHref({ plan: p })}
              aria-current={p === plan ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold transition-colors",
                p === plan
                  ? "border-brand-soft bg-brand-soft text-black"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {PLAN_LABELS[p]}
            </Link>
          ))}
        </nav>
      </PageHero>

      {/* Light / dark / light, like every other page: headline figures on
          the page ground, chart and monthly table in a dark results band (as
          on the plan pages), and the long register back on light, where a
          dense table is easiest to read. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <Eyebrow>{PLAN_LABELS[plan]} · обобщение</Eyebrow>
        <p className="text-muted-foreground mt-3 text-sm">
          {totals.bets > 0
            ? `${totals.bets} залога от ${formatDate(totals.first)} до ${formatDate(totals.last)}`
            : "Все още няма записани залози за този план."}
        </p>
        <div className="mt-6">
          <ResultsStats totals={totals} drawdown={drawdown} />
        </div>
        <RoiNote className="mt-3" />
      </section>

      <DarkSection>
        <Eyebrow>Проследени резултати</Eyebrow>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight">
          Обща печалба във времето
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          Горната линия е натрупаната печалба в края на всеки ден. Долната лента
          показва колко е била под най-високата си точка дотогава — там се
          виждат губещите периоди.
        </p>
        <div className="mt-8">
          <ProfitChart points={curve} />
        </div>

        <h2
          id="months"
          className="mt-16 scroll-mt-28 text-2xl font-extrabold tracking-tight"
        >
          Месец по месец
        </h2>
        <div className="mt-6">
          <MonthlySummary rows={monthRows} current={current} />
        </div>
        <TableFooter>
          <Pagination
            label="Страници на месеците"
            current={query.mpage}
            pages={monthPages}
            hrefFor={(mpage) => resultsHref({ ...query, mpage }, "months")}
          />
          <RowsPicker
            options={MONTH_ROWS}
            current={query.mrows}
            hrefFor={(mrows) =>
              resultsHref({ ...query, mrows, mpage: 1 }, "months")
            }
          />
        </TableFooter>
      </DarkSection>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <h2
          id="register"
          className="scroll-mt-28 text-3xl font-extrabold tracking-tight"
        >
          Всички залози
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          „Общо“ е печалбата на плана след съответния залог, а „Спад“ — колко е
          тя под най-високата си точка дотогава. И двете се изчисляват върху
          цялата история, дори когато филтрирате.
        </p>
        <div className="mt-6">
          <BetRegister
            query={query}
            months={months.map((m) => m.month)}
            rows={register.rows}
            total={register.total}
            pages={register.pages}
          />
        </div>
      </section>
    </main>
  );
}
