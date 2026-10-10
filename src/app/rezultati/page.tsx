import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";

import { PageShell } from "@/components/site/page-shell";
import { db } from "@/db";
import { bets } from "@/db/schema";

const TITLE = "Резултати";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
  description:
    "Пълен регистър на нашите прогнози — печалби и загуби, месец по месец.",
};

/**
 * Placeholder until Phase 4 builds the charts and the paginated per-bet table.
 * It already reads real data so the page is never misleading about what exists.
 */
export default async function ResultsPage() {
  const [summary] = await db
    .select({
      total: sql<number>`count(*)`,
      months: sql<number>`count(distinct ${bets.month})`,
      first: sql<string>`min(${bets.date})`,
      last: sql<string>`max(${bets.date})`,
    })
    .from(bets);

  const monthly = await db
    .select({
      month: bets.month,
      plan: bets.plan,
      profit: sql<string>`round(sum(${bets.profit}), 2)`,
      roi: sql<number>`round(sum(${bets.profit}) / nullif(sum(${bets.stake}), 0) * 100)`,
    })
    .from(bets)
    .groupBy(bets.month, bets.plan)
    .orderBy(desc(bets.month))
    .limit(12);

  return (
    <PageShell
      title="Всеки залог, публично"
      eyebrow="Резултати"
      lead="Проследяваме всяка прогноза — печеливша или не. По-долу е обобщението по месеци; пълният регистър идва скоро."
      crumbs={[
        { href: "/", label: "Начало" },
        { href: "/rezultati", label: TITLE },
      ]}
      width="wide"
    >
      <p className="text-muted-foreground mb-8 text-sm">
        {summary.total} записани залога в {summary.months} месеца, от{" "}
        {summary.first} до {summary.last}.
      </p>

      <div className="border-border bg-card overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-border border-b text-xs tracking-widest uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-normal">Месец</th>
              <th className="px-4 py-3 text-left font-normal">План</th>
              <th className="px-4 py-3 text-right font-normal">ROI</th>
              <th className="px-4 py-3 text-right font-normal">Печалба</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((row) => (
              <tr
                key={`${row.month}-${row.plan}`}
                className="border-border border-b last:border-0"
              >
                <td className="px-4 py-3 font-mono">{row.month}</td>
                <td className="px-4 py-3">
                  {row.plan === "premium" ? "Премиум" : "Безплатен"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono ${Number(row.roi) >= 0 ? "text-win" : "text-loss"}`}
                >
                  {Number(row.roi) >= 0 ? "+" : ""}
                  {row.roi}%
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  €{row.profit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
