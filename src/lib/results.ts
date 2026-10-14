import { and, desc, eq, ne, sql, type SQL } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { bets } from "@/db/schema";

export type Plan = "free" | "premium";

export const PLAN_LABELS: Record<Plan, string> = {
  premium: "Премиум",
  free: "Безплатен",
};

/** "YYYY-MM" of today in Bulgaria - the month whose figures are still moving. */
export function currentMonth(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}
export type BetResult = (typeof bets.$inferSelect)["result"];

export const PLANS: readonly Plan[] = ["premium", "free"];

/**
 * Shared reads over the bets table, so the home page, the plan pages and
 * /rezultati can never quote different numbers. Everything is derived from the
 * per-bet rows in SQL - there is deliberately no summary table (spec §9).
 *
 * Money is level stakes: every bet is €20 each-way (€10 win + €10 place), so
 * the euro figures are a notional record, not anyone's bankroll. Queries still
 * sum `stake` rather than assuming 20, so variable stakes would just work.
 */

/**
 * The plan's bets in chronological order with two running figures per row:
 * `cumulative` profit so far, and `drawdown`, the distance below the highest
 * cumulative profit reached so far (0 at a new peak, negative otherwise). The
 * peak starts at 0 so a losing start counts as drawdown from the first bet.
 *
 * Computed over the whole plan before any filtering, so a row on page 37 of a
 * filtered register still shows its true running position. The id breaks ties
 * between bets with the same date and time so the order is stable.
 */
const ledger = (plan: Plan) => sql`
  with running as (
    select
      id, date, time, course, race, horse, odds, result, stake, profit, month,
      sum(profit) over (order by date, time nulls first, id) as cumulative
    from ${bets}
    where plan = ${plan}
  ),
  ledger as (
    select
      *,
      cumulative - greatest(
        0,
        max(cumulative) over (order by date, time nulls first, id)
      ) as drawdown
    from running
  )
`;

/** Month-by-month profit and ROI, newest first. */
export const monthlyProfit = cache(async (plan: Plan, limit = 12) =>
  db
    .select({
      month: bets.month,
      bets: sql<number>`count(*)::int`,
      profit: sql<string>`round(sum(${bets.profit}), 2)`,
      roi: sql<number>`round(sum(${bets.profit}) / nullif(sum(${bets.stake}), 0) * 100)`,
    })
    .from(bets)
    .where(eq(bets.plan, plan))
    .groupBy(bets.month)
    .orderBy(desc(bets.month))
    .limit(limit),
);

export type MonthSummary = {
  month: string;
  bets: number;
  won: number;
  placed: number;
  staked: string;
  profit: string;
  roi: string | null;
  cumulative: string;
};

/**
 * Every month of a plan, newest first, with the counts and the cumulative
 * profit at month end - the spec's monthly summary table.
 */
export const monthlySummary = cache(async (plan: Plan) => {
  const rows = await db.execute<MonthSummary>(sql`
    select
      month,
      count(*)::int as bets,
      (count(*) filter (where result = 'WON'))::int as won,
      (count(*) filter (where result = 'PLACED'))::int as placed,
      sum(stake) as staked,
      sum(profit) as profit,
      round(sum(profit) / nullif(sum(stake), 0) * 100, 1) as roi,
      sum(sum(profit)) over (order by month) as cumulative
    from ${bets}
    where plan = ${plan}
    group by month
    order by month desc
  `);
  return [...rows];
});

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
      bets: sql<number>`count(*)::int`,
      won: sql<number>`(count(*) filter (where ${bets.result} = 'WON'))::int`,
      placed: sql<number>`(count(*) filter (where ${bets.result} = 'PLACED'))::int`,
      voided: sql<number>`(count(*) filter (where ${bets.result} = 'Void'))::int`,
      months: sql<number>`count(distinct ${bets.month})::int`,
      winningMonths: sql<number>`(
        select count(*)::int from (
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
  const settled = row.bets - row.voided;
  return {
    ...row,
    /** Lifetime ROI: profit over everything staked, in percent. */
    roi: staked > 0 ? (Number(row.profit) / staked) * 100 : 0,
    /** Share of settled (non-void) bets that won outright, in percent. */
    winRate: settled > 0 ? (row.won / settled) * 100 : 0,
    /** Share that returned something: won or placed, in percent. */
    returnRate: settled > 0 ? ((row.won + row.placed) / settled) * 100 : 0,
  };
});

export type ProfitPoint = {
  date: string;
  cumulative: number;
  drawdown: number;
};

/**
 * Cumulative profit at the end of each betting day - the chart series. Taken
 * from the per-bet ledger so the chart and the register always agree.
 */
export const profitCurve = cache(async (plan: Plan): Promise<ProfitPoint[]> => {
  const rows = await db.execute<{
    date: string;
    cumulative: string;
    drawdown: string;
  }>(sql`
    ${ledger(plan)}
    select distinct on (date) date, cumulative, drawdown
    from ledger
    order by date, time desc nulls last, id desc
  `);
  return rows.map((row) => ({
    date: row.date,
    cumulative: Number(row.cumulative),
    drawdown: Number(row.drawdown),
  }));
});

/**
 * The deepest fall from a profit peak over the plan's whole history, with the
 * date the bottom was reached and the date of the peak it fell from.
 */
export const maxDrawdown = cache(async (plan: Plan) => {
  const [row] = await db.execute<{
    amount: string | null;
    trough: string | null;
    peak: string | null;
  }>(sql`
    ${ledger(plan)},
    worst as (
      select date, time, id, cumulative, drawdown
      from ledger
      order by drawdown, date, time nulls first, id
      limit 1
    )
    select
      worst.drawdown as amount,
      worst.date as trough,
      (
        select max(l.date) from ledger l
        where (l.date, l.time, l.id) <= (worst.date, worst.time, worst.id)
          and l.drawdown = 0
      ) as peak
    from worst
  `);

  const amount = Number(row?.amount ?? 0);
  return {
    amount,
    trough: amount < 0 ? (row?.trough ?? null) : null,
    // Null when the plan fell below zero before it ever made a profit.
    peak: amount < 0 ? (row?.peak ?? null) : null,
  };
});

export type RegisterFilters = {
  plan: Plan;
  month?: string;
  q?: string;
  page: number;
  /** Rows per page. */
  rows: number;
};

export type RegisterRow = {
  id: string;
  date: string;
  time: string | null;
  course: string;
  race: string | null;
  horse: string;
  odds: string | null;
  result: BetResult;
  profit: string;
  cumulative: string;
  drawdown: string;
};

/** Escape LIKE wildcards so a search for "50%" means the literal text. */
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

/**
 * One page of the public per-bet register, newest first, with the running
 * profit and drawdown each row had at the time (see `ledger`). Filters by
 * month and by a horse/course search.
 */
export async function betRegister({
  plan,
  month,
  q,
  page,
  rows: pageSize,
}: RegisterFilters) {
  const conditions: SQL[] = [];
  if (month) conditions.push(sql`month = ${month}`);
  if (q) {
    const pattern = likePattern(q);
    conditions.push(sql`(horse ilike ${pattern} or course ilike ${pattern})`);
  }
  const where = conditions.length
    ? sql`where ${sql.join(conditions, sql` and `)}`
    : sql``;

  const [[{ total }], rows] = await Promise.all([
    db.execute<{ total: number }>(sql`
      select count(*)::int as total from ${bets}
      where plan = ${plan}
      ${conditions.length ? sql`and ${sql.join(conditions, sql` and `)}` : sql``}
    `),
    db.execute<RegisterRow>(sql`
      ${ledger(plan)}
      select id, date, time, course, race, horse, odds, result, profit,
        cumulative, drawdown
      from ledger
      ${where}
      order by date desc, time desc nulls last, id desc
      limit ${pageSize}
      offset ${(page - 1) * pageSize}
    `),
  ]);

  return {
    rows: [...rows],
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
