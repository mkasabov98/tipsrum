import { formatEurSigned, formatMonth, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MonthlyRow = {
  month: string;
  bets: number;
  profit: string;
  roi: number | string | null;
};

/**
 * Month-by-month profit, newest first, with a bar whose width is relative to
 * the biggest absolute month in the set. Each row carries its bet count,
 * because euros and ROI only reconcile once you know how much was staked: a
 * 5-day month can show +20% on €135 while a full one shows +60% on €2 327.
 */
export function MonthlyProfit({
  rows,
  current,
}: {
  rows: readonly MonthlyRow[];
  /** The month still in progress, flagged so a partial month is not misread. */
  current?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Няма записани резултати за този план.
      </p>
    );
  }

  const peak = Math.max(...rows.map((row) => Math.abs(Number(row.profit))), 1);

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <ul>
        {rows.map((row) => {
          const profit = Number(row.profit);
          const roi = Number(row.roi ?? 0);
          const width = `${Math.max((Math.abs(profit) / peak) * 100, 2)}%`;

          return (
            <li
              key={row.month}
              // Flex rather than a grid: the bar is hidden on narrow screens
              // and display:none drops its grid cell, shifting everything left.
              className="border-border flex items-center gap-4 border-b px-5 py-3.5 last:border-0 sm:gap-5"
            >
              <span className="w-32 shrink-0 sm:w-36">
                <span className="block text-xs sm:text-sm">
                  {formatMonth(row.month)}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {row.bets} залога
                  {row.month === current && (
                    <span className="text-foreground font-semibold">
                      {" "}
                      · в ход
                    </span>
                  )}
                </span>
              </span>
              <span
                aria-hidden
                className="bg-muted hidden h-1.5 flex-1 overflow-hidden rounded-full sm:block"
              >
                <span
                  className={cn(
                    "block h-full rounded-full",
                    profit >= 0 ? "bg-mint" : "bg-loss",
                  )}
                  style={{ width }}
                />
              </span>
              <span
                className={cn(
                  "ml-auto w-14 shrink-0 text-right font-mono text-xs sm:ml-0 sm:text-sm",
                  roi >= 0 ? "text-win" : "text-loss",
                )}
              >
                {formatPercent(roi)}
              </span>
              <span className="w-22 shrink-0 text-right font-mono text-xs font-semibold sm:text-sm">
                {formatEurSigned(row.profit)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The one-line key that sits under every monthly list. */
export function RoiNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-muted-foreground text-xs", className)}>
      Всеки залог е €20 (€10 за победа + €10 за място). ROI = печалба ÷ сума на
      залозите за месеца, затова месец с малко залози може да има висок процент
      при малка сума.
    </p>
  );
}
