import type { BetResult } from "@/lib/results";
import { cn } from "@/lib/utils";

// Bulgarian labels from the design. Void is not in the design; it gets a
// neutral badge rather than being hidden, because hiding rows would undercut
// the "every bet, in public" promise.
const LABELS: Record<BetResult, string> = {
  WON: "Победа",
  PLACED: "Място",
  Lost: "Загуба",
  Void: "Анулиран",
};

const STYLES: Record<BetResult, string> = {
  WON: "bg-mint/15 text-win",
  PLACED: "bg-brand-soft/20 text-win",
  Lost: "bg-loss/10 text-loss",
  Void: "bg-muted text-muted-foreground",
};

export function ResultBadge({ result }: { result: BetResult }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        STYLES[result],
      )}
    >
      {LABELS[result]}
    </span>
  );
}
