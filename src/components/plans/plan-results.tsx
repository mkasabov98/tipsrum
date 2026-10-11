import Link from "next/link";

import {
  MonthlyProfit,
  type MonthlyRow,
} from "@/components/results/monthly-profit";
import { RecentBets, type BetRow } from "@/components/results/recent-bets";
import { DarkSection, Eyebrow } from "@/components/site/page-shell";

/**
 * The results block both plan pages end on: profit per month, then the last
 * settled bets. Honest by construction - every figure is summed from the bets
 * table, losing months included.
 */
export function PlanResults({
  title,
  lead,
  monthly,
  bets,
}: {
  title: string;
  lead: string;
  monthly: readonly MonthlyRow[];
  bets: readonly BetRow[];
}) {
  return (
    <DarkSection>
      <Eyebrow>Проследени резултати</Eyebrow>
      <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="text-muted-foreground mt-4 max-w-2xl">{lead}</p>

      <div className="mt-8">
        <MonthlyProfit rows={monthly} />
      </div>

      <h3 className="mt-12 text-xl font-bold tracking-tight">
        Последни залози
      </h3>
      <div className="mt-5">
        <RecentBets rows={bets} />
      </div>

      <p className="mt-6">
        <Link
          href="/rezultati"
          className="text-brand-soft text-sm underline-offset-4 hover:underline"
        >
          Покажи пълния регистър →
        </Link>
      </p>
    </DarkSection>
  );
}
