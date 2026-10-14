import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BetRegister,
  registerHref,
  type RegisterQuery,
} from "@/components/results/bet-register";
import { RoiNote } from "@/components/results/monthly-profit";
import { MonthlySummary } from "@/components/results/monthly-summary";
import { ProfitChart } from "@/components/results/profit-chart";
import { ResultsStats } from "@/components/results/results-stats";
import { Eyebrow, PageHero } from "@/components/site/page-shell";
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
  type Plan,
} from "@/lib/results";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Резултати | Tipsrum",
  description:
    "Пълен публичен регистър на прогнозите ни — всеки залог, печалба и загуба, месец по месец, за Премиум и Безплатния план.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Query params are user input: anything unrecognised falls back to the
 * default rather than erroring, so a mangled shared link still opens.
 */
function parseQuery(params: Awaited<SearchParams>): RegisterQuery {
  const plan = one(params.plan);
  const month = one(params.month);
  const q = one(params.q)?.trim().slice(0, 60);
  const page = Number.parseInt(one(params.page) ?? "", 10);
  return {
    plan: PLANS.includes(plan as Plan) ? (plan as Plan) : "premium",
    month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : undefined,
    q: q || undefined,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = parseQuery(await searchParams);
  const { plan } = query;

  const [totals, drawdown, curve, months, register] = await Promise.all([
    planTotals(plan),
    maxDrawdown(plan),
    profitCurve(plan),
    monthlySummary(plan),
    betRegister(query),
  ]);
  // A stale link past the last page (the register shrank, or a filter
  // changed) lands on the last real page instead of an empty table.
  if (register.total > 0 && query.page > register.pages) {
    redirect(registerHref({ ...query, page: register.pages }));
  }
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
              href={registerHref({ plan: p, page: 1 }).replace("#register", "")}
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

        <h2 className="mt-14 text-2xl font-extrabold tracking-tight">
          Обща печалба във времето
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Горната линия е натрупаната печалба в края на всеки ден. Долната лента
          показва колко е била под най-високата си точка дотогава — там се
          виждат губещите периоди.
        </p>
        <div className="mt-6">
          <ProfitChart points={curve} />
        </div>

        <h2 className="mt-14 text-2xl font-extrabold tracking-tight">
          Месец по месец
        </h2>
        <div className="mt-6">
          <MonthlySummary rows={months} current={current} />
        </div>

        <h2
          id="register"
          className="mt-14 scroll-mt-28 text-2xl font-extrabold tracking-tight"
        >
          Всички залози
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
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
