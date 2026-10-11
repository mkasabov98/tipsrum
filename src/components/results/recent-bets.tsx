import { formatEurSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BetRow = {
  date: string;
  course: string;
  horse: string;
  odds: string | null;
  result: "WON" | "PLACED" | "Lost" | "Void";
  profit: string;
};

const RESULT_LABELS: Record<BetRow["result"], string> = {
  WON: "Печели",
  PLACED: "Място",
  Lost: "Губи",
  Void: "Анулиран",
};

const RESULT_STYLES: Record<BetRow["result"], string> = {
  WON: "bg-mint/15 text-win",
  PLACED: "bg-brand-soft/20 text-win",
  Lost: "bg-loss/10 text-loss",
  Void: "bg-muted text-muted-foreground",
};

/**
 * The last few settled bets for a plan. Phase 4 adds the filterable, paginated
 * register on /rezultati; this is the short sample the plan pages show.
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
                {row.date}
              </td>
              <td className="px-4 py-3">{row.course}</td>
              <td className="px-4 py-3 font-medium">{row.horse}</td>
              <td className="px-4 py-3 text-right font-mono">
                {row.odds ? Number(row.odds).toFixed(2) : "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    RESULT_STYLES[row.result],
                  )}
                >
                  {RESULT_LABELS[row.result]}
                </span>
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
