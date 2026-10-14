"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import {
  formatEur,
  formatEurSigned,
  formatMonthShort,
  formatShortDate,
} from "@/lib/format";
import type { ProfitPoint } from "@/lib/results";

// Unsigned above zero, "−€500" below - the axis should not shout "+" at every tick.
const euroTick = (value: number) =>
  value < 0 ? formatEurSigned(value) : formatEur(value);

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  const point = payload?.[0]?.payload as ProfitPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="border-border bg-card text-card-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground font-mono">
        {formatShortDate(point.date)}
      </p>
      <p className="mt-1 font-semibold">
        Обща печалба: {formatEurSigned(point.cumulative)}
      </p>
      {point.drawdown < 0 && (
        <p className="text-loss mt-0.5">
          Под върха: {formatEurSigned(point.drawdown)}
        </p>
      )}
    </div>
  );
}

/**
 * Y scale for the profit line. Left to itself Recharts snaps the bottom to a
 * whole tick, so an early dip to -€80 stretched the axis down to -€5 000. Here
 * the domain hugs the real low and high, and ticks are round steps from zero.
 */
function profitScale(points: readonly ProfitPoint[]) {
  const values = points.map((p) => p.cumulative);
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  const span = Math.max(high - low, 1);
  const magnitude = 10 ** Math.floor(Math.log10(span / 4));
  const step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => span / s <= 5) ??
    10 * magnitude;
  const ticks: number[] = [];
  for (let t = Math.ceil(low / step) * step; t <= high; t += step)
    ticks.push(t || 0); // ceil(-80 / 5000) * 5000 is -0, which prints "€-0"
  return { domain: [low, high] as [number, number], ticks };
}

/**
 * Cumulative profit at the end of every betting day, with an "underwater"
 * strip below it showing how far the plan sat under its previous best. The
 * second strip is the honest half: the top line alone hides how long the
 * flat and losing stretches lasted.
 *
 * Colours come from the theme tokens, so the chart reads on the light page
 * ground and inside the dark results bands alike.
 */
export function ProfitChart({ points }: { points: readonly ProfitPoint[] }) {
  const id = useId();
  const fill = `${id}-fill`;

  if (points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Няма записани резултати за този план.
      </p>
    );
  }

  const data = [...points];
  // One tick per month at most: label the first day seen in each month.
  const monthTicks = data
    .filter(
      (p, i) => i === 0 || p.date.slice(0, 7) !== data[i - 1].date.slice(0, 7),
    )
    .map((p) => p.date);
  const scale = profitScale(data);
  const shared = {
    data,
    syncId: id,
    margin: { top: 8, right: 8, bottom: 0, left: 8 },
  };
  const xAxis = (
    <XAxis
      dataKey="date"
      ticks={monthTicks}
      interval="preserveStartEnd"
      minTickGap={24}
      tickFormatter={(date: string) => formatMonthShort(date.slice(0, 7))}
      {...axis}
    />
  );

  return (
    <figure
      className="border-border bg-card rounded-xl border p-4 sm:p-6"
      aria-label={`Обща печалба от ${formatShortDate(data[0].date)} до ${formatShortDate(data[data.length - 1].date)}: ${formatEurSigned(data[data.length - 1].cumulative)}`}
    >
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...shared}>
            <defs>
              <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            {xAxis}
            <YAxis
              width={64}
              domain={scale.domain}
              ticks={scale.ticks}
              tickFormatter={euroTick}
              {...axis}
            />
            <ReferenceLine
              y={0}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.5}
            />
            <Tooltip
              content={ChartTooltip}
              cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.4 }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill={`url(#${fill})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-muted-foreground mt-4 mb-1 text-[11px] tracking-widest uppercase">
        Под предишния връх
      </p>
      <div className="h-20 sm:h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...shared}>
            <XAxis dataKey="date" hide />
            <YAxis
              width={64}
              tickFormatter={euroTick}
              tickCount={3}
              {...axis}
            />
            <Tooltip content={ChartTooltip} cursor={false} />
            <Area
              type="stepAfter"
              dataKey="drawdown"
              stroke="var(--loss)"
              strokeWidth={1}
              fill="var(--loss)"
              fillOpacity={0.2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
