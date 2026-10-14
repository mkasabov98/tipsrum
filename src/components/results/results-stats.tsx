import { formatEurSigned, formatPercent, formatShortDate } from "@/lib/format";
import type { maxDrawdown, planTotals } from "@/lib/results";
import { cn } from "@/lib/utils";

type Totals = Awaited<ReturnType<typeof planTotals>>;
type Drawdown = Awaited<ReturnType<typeof maxDrawdown>>;

/**
 * The headline figures for a plan, every one summed live from `bets`. The
 * worst drawdown sits beside the profit on purpose: a record that only shows
 * the top line is a sales pitch, not a track record.
 */
export function ResultsStats({
  totals,
  drawdown,
}: {
  totals: Totals;
  drawdown: Drawdown;
}) {
  const profit = Number(totals.profit);
  const stats = [
    {
      label: "Обща печалба",
      value: formatEurSigned(profit),
      tone: profit >= 0 ? "win" : "loss",
    },
    {
      label: "ROI (печалба ÷ заложено)",
      value: formatPercent(totals.roi),
      tone: totals.roi >= 0 ? "win" : "loss",
    },
    {
      label: "Залога",
      value: String(totals.bets),
      hint: totals.voided > 0 ? `от тях ${totals.voided} анулирани` : undefined,
    },
    {
      label: "Победи / с възвращение",
      value: `${Math.round(totals.winRate)}% / ${Math.round(totals.returnRate)}%`,
      hint: "победа или място",
    },
    {
      label: "Печеливши месеци",
      value: `${totals.winningMonths} от ${totals.months}`,
    },
    {
      label: "Най-голям спад",
      value: formatEurSigned(drawdown.amount),
      tone: drawdown.amount < 0 ? "loss" : undefined,
      hint:
        drawdown.trough &&
        `${drawdown.peak ? `${formatShortDate(drawdown.peak)} – ` : "до "}${formatShortDate(drawdown.trough)}`,
    },
  ] as const satisfies readonly {
    label: string;
    value: string;
    tone?: "win" | "loss";
    hint?: string | null;
  }[];

  return (
    <dl className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-xl border lg:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          // Hairlines between tiles: every tile draws its own top and left
          // border and the container clips the outer edge.
          className="border-border -mt-px -ml-px border-t border-l p-4 sm:p-5"
        >
          <dt className="text-muted-foreground text-[11px] tracking-wider uppercase">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "mt-2 text-xl font-extrabold tracking-tight sm:text-2xl",
              "tone" in stat && stat.tone === "win" && "text-win",
              "tone" in stat && stat.tone === "loss" && "text-loss",
            )}
          >
            {stat.value}
          </dd>
          {"hint" in stat && stat.hint && (
            <dd className="text-muted-foreground mt-1 text-[11px]">
              {stat.hint}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
