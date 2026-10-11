import { cn } from "@/lib/utils";

export type Stat = { value: string; label: string; accent?: boolean };

/**
 * The three-figure band under a plan's hero. Inherits its palette, so it works
 * on the dark hero band and on the light page body alike.
 */
export function PlanStats({ stats }: { stats: readonly Stat[] }) {
  return (
    <dl className="border-border mt-10 grid grid-cols-1 gap-px border-t sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "border-border py-6 sm:px-6",
            i === 0 && "sm:pl-0",
            i > 0 && "border-t sm:border-t-0 sm:border-l",
          )}
        >
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span
              className={cn(
                "block text-3xl font-extrabold tracking-tight",
                stat.accent && "text-mint",
              )}
            >
              {stat.value}
            </span>
            <span className="text-muted-foreground mt-1 block text-sm">
              {stat.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
