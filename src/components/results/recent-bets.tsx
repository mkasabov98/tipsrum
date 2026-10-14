import { ResultBadge } from "@/components/results/result-badge";
import { formatEurSigned, formatShortDate } from "@/lib/format";
import type { BetResult } from "@/lib/results";
import { cn } from "@/lib/utils";

export type BetRow = {
  date: string;
  course: string;
  horse: string;
  odds: string | null;
  result: BetResult;
  profit: string;
};

/**
 * The last few settled bets for a plan - the short sample the plan pages show.
 * The full, filterable register is BetRegister on /rezultati.
 */
export function RecentBets({ rows }: { rows: readonly BetRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Няма записани залози за този план.
      </p>
    );
  }

  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="w-full min-w-140 text-sm">
        <thead className="text-muted-foreground border-border border-b text-[11px] tracking-widest uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-normal">
              Дата
            </th>
            <th scope="col" className="px-4 py-3 text-left font-normal">
              Хиподрум
            </th>
            <th scope="col" className="px-4 py-3 text-left font-normal">
              Кон
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Коеф.
            </th>
            <th scope="col" className="px-4 py-3 text-left font-normal">
              Резултат
            </th>
            <th scope="col" className="px-4 py-3 text-right font-normal">
              Печалба
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.date}-${row.course}-${row.horse}`}
              className="border-border border-b last:border-0"
            >
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                {formatShortDate(row.date)}
              </td>
              <td className="px-4 py-3">{row.course}</td>
              <td className="px-4 py-3 font-medium">{row.horse}</td>
              <td className="px-4 py-3 text-right font-mono">
                {row.odds ? Number(row.odds).toFixed(2) : "—"}
              </td>
              <td className="px-4 py-3">
                <ResultBadge result={row.result} />
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-mono font-semibold",
                  Number(row.profit) >= 0 ? "text-win" : "text-loss",
                )}
              >
                {formatEurSigned(row.profit, { decimals: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
