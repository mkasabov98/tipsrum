import { and, desc, eq, ne, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { bets } from "@/db/schema";

export type Plan = "free" | "premium";

/**
 * Shared reads over the bets table, so the home page and the plan pages can
 * never quote different numbers. Monthly ROI is profit over turnover for the
 * month, computed in SQL - there is deliberately no summary table (spec §9).
 */
export const monthlyProfit = cache(async (plan: Plan, limit = 12) =>
  db
    .select({
      month: bets.month,
      profit: sql<string>`round(sum(${bets.profit}), 2)`,
      roi: sql<number>`round(sum(${bets.profit}) / nullif(sum(${bets.stake}), 0) * 100)`,
    })
    .from(bets)
    .where(eq(bets.plan, plan))
    .groupBy(bets.month)
    .orderBy(desc(bets.month))
    .limit(limit),
);

/** Latest settled bets, newest first. Void rows are skipped - nothing to show. */
export const recentBets = cache(async (plan: Plan, limit = 10) =>
  db
    .select({
      date: bets.date,
      course: bets.course,
      horse: bets.horse,
      odds: bets.odds,
      result: bets.result,
      profit: bets.profit,
    })
    .from(bets)
    .where(and(eq(bets.plan, plan), ne(bets.result, "Void")))
    .orderBy(desc(bets.date), desc(bets.time))
    .limit(limit),
);

export const planTotals = cache(async (plan: Plan) => {
  const [row] = await db
    .select({
      profit: sql<string>`coalesce(sum(${bets.profit}), 0)`,
      staked: sql<string>`coalesce(sum(${bets.stake}), 0)`,
      bets: sql<number>`count(*)`,
      months: sql<number>`count(distinct ${bets.month})`,
      winningMonths: sql<number>`(
        select count(*) from (
          select 1 from ${bets} b
          where b.plan = ${plan}
          group by b.month
          having sum(b.profit) > 0
        ) winners
      )`,
      first: sql<string>`min(${bets.date})`,
      last: sql<string>`max(${bets.date})`,
    })
    .from(bets)
    .where(eq(bets.plan, plan));

  const staked = Number(row.staked);
  return {
    ...row,
    /** Lifetime ROI: profit over everything staked, in percent. */
    roi: staked > 0 ? (Number(row.profit) / staked) * 100 : 0,
  };
});
