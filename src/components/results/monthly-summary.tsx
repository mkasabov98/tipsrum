import {
  formatEur,
  formatEurSigned,
  formatMonth,
  formatPercent,
} from "@/lib/format";
import type { MonthSummary } from "@/lib/results";
import { cn } from "@/lib/utils";

const tone = (value: number) => (value >= 0 ? "text-win" : "text-loss");

/**
 * Every month of a plan, newest first: the spec's monthly summary with the
 * cumulative profit at month end. Shows the stake column so ROI and euros can
 * be reconciled at a glance.
 */
export function MonthlySummary({
  rows,
  current,
}: {
  rows: readonly MonthSummary[];
  current?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Няма записани резултати за този план.
      </p>
    );
  }

  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="w-full min-w-160 text-sm">
        <thead className="text-muted-foreground border-border border-b text-[11px] tracking-widest uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-normal">
              Месец
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Залози
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Победи / Място
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Заложено
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Печалба
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              ROI
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Общо
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.month}
              className="border-border border-b last:border-0"
            >
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {formatMonth(row.month)}
                {row.month === current && (
                  <span className="bg-brand-soft/30 text-foreground ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    в ход
                  </span>
                )}
              </th>
              <td className="px-4 py-3 text-right font-mono">{row.bets}</td>
              <td className="text-muted-foreground px-4 py-3 text-right font-mono">
                {row.won} / {row.placed}
              </td>
              <td className="text-muted-foreground px-4 py-3 text-right font-mono">
                {formatEur(row.staked)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-mono font-semibold",
                  tone(Number(row.profit)),
                )}
              >
                {formatEurSigned(row.profit)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-mono",
                  tone(Number(row.roi ?? 0)),
                )}
              >
                {formatPercent(Number(row.roi ?? 0))}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatEurSigned(row.cumulative)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
