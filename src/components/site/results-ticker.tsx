import { Marquee } from "@/components/site/marquee";
import { formatMonthShort, formatPercent } from "@/lib/format";
import { monthlyProfit } from "@/lib/results";
import { cn } from "@/lib/utils";

const MONTHS_SHOWN = 12;

/**
 * The strip above the header: premium ROI for the last 12 months, scrolling
 * edge to edge. Figures come from the bets table - the design's were
 * placeholders.
 */
export async function ResultsTicker() {
  const rows = await monthlyProfit("premium", MONTHS_SHOWN);

  if (rows.length === 0) return null;

  const months = [...rows].reverse();

  const chips = months.map((row) => {
    const roi = Number(row.roi ?? 0);
    const up = roi >= 0;
    return (
      <span
        key={row.month}
        className="border-border/60 flex shrink-0 items-center gap-2 border-l px-4 py-2 font-mono text-[11px] tracking-wider"
      >
        <span className="text-muted-foreground uppercase">
          {formatMonthShort(row.month)}
        </span>
        <span className={cn(up ? "text-win" : "text-loss")}>
          {formatPercent(roi)}
        </span>
        <span
          aria-hidden
          className={cn("text-[9px]", up ? "text-win" : "text-loss")}
        >
          {up ? "▲" : "▼"}
        </span>
      </span>
    );
  });

  return (
    <div className="dark bg-background text-foreground border-border/60 flex items-center border-b">
      <p className="text-muted-foreground bg-background z-10 flex shrink-0 items-center gap-2 py-2 pr-4 pl-4 font-mono text-[11px] tracking-widest uppercase">
        <span className="bg-brand-soft size-1.5 rounded-full" aria-hidden />
        <span className="hidden sm:inline">Премиум · последни 12 месеца</span>
        <span className="sm:hidden">Премиум</span>
      </p>
      <Marquee durationSeconds={45} className="flex-1">
        {chips}
      </Marquee>
    </div>
  );
}
