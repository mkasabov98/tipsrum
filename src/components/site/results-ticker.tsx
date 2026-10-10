import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { bets } from "@/db/schema";
import { cn } from "@/lib/utils";

const MONTHS_SHOWN = 12;

// "2026-09" -> "СЕП 26", matching the design's compact ticker labels.
const MONTH_LABELS = [
  "ЯНУ",
  "ФЕВ",
  "МАР",
  "АПР",
  "МАЙ",
  "ЮНИ",
  "ЮЛИ",
  "АВГ",
  "СЕП",
  "ОКТ",
  "НОЕ",
  "ДЕК",
];

function label(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_LABELS[Number(m) - 1]} ${year.slice(2)}`;
}

/**
 * The strip above the header: the last 12 months of premium ROI.
 * Figures come from the bets table - the design's numbers were placeholders.
 */
export async function ResultsTicker() {
  const rows = await db
    .select({
      month: bets.month,
      roi: sql<number>`round(sum(${bets.profit}) / nullif(sum(${bets.stake}), 0) * 100)`,
    })
    .from(bets)
    .where(eq(bets.plan, "premium"))
    .groupBy(bets.month)
    .orderBy(desc(bets.month))
    .limit(MONTHS_SHOWN);

  if (rows.length === 0) return null;

  const months = [...rows].reverse();

  return (
    <div className="dark bg-background text-foreground border-border/60 border-b">
      <div className="mx-auto flex w-full max-w-6xl [scrollbar-width:none] items-center gap-0 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        <p className="text-muted-foreground flex shrink-0 items-center gap-2 py-2 pr-4 font-mono text-[11px] tracking-widest uppercase">
          <span className="bg-brand-soft size-1.5 rounded-full" aria-hidden />
          Премиум · последни 12 месеца
        </p>
        <ul className="flex items-center">
          {months.map((row) => {
            const roi = Number(row.roi ?? 0);
            const up = roi >= 0;
            return (
              <li
                key={row.month}
                className="border-border/60 flex shrink-0 items-center gap-2 border-l px-4 py-2 font-mono text-[11px] tracking-wider"
              >
                <span className="text-muted-foreground uppercase">
                  {label(row.month)}
                </span>
                <span className={cn(up ? "text-win" : "text-loss")}>
                  {up ? "+" : ""}
                  {roi}%
                </span>
                <span
                  aria-hidden
                  className={cn("text-[9px]", up ? "text-win" : "text-loss")}
                >
                  {up ? "▲" : "▼"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
