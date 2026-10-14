import Link from "next/link";

import { ResultBadge } from "@/components/results/result-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEurSigned, formatMonth, formatShortDate } from "@/lib/format";
import type { Plan, RegisterRow } from "@/lib/results";
import { cn } from "@/lib/utils";

export type RegisterQuery = {
  plan: Plan;
  month?: string;
  q?: string;
  page: number;
};

/** Builds a /rezultati link, dropping defaults so URLs stay short. */
export function registerHref(query: RegisterQuery): string {
  const params = new URLSearchParams();
  if (query.plan !== "premium") params.set("plan", query.plan);
  if (query.month) params.set("month", query.month);
  if (query.q) params.set("q", query.q);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return `/rezultati${search ? `?${search}` : ""}#register`;
}

const tone = (value: number) => (value >= 0 ? "text-win" : "text-loss");

/**
 * The public per-bet register. Filtering and paging are plain GET requests -
 * the form submits to the same URL - so every view is linkable, the back
 * button works, and the table needs no client JavaScript at all.
 */
export function BetRegister({
  query,
  months,
  rows,
  total,
  pages,
}: {
  query: RegisterQuery;
  months: readonly string[];
  rows: readonly RegisterRow[];
  total: number;
  pages: number;
}) {
  const filtered = Boolean(query.month || query.q);

  return (
    <div>
      <form
        action="/rezultati#register"
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        {query.plan !== "premium" && (
          <input type="hidden" name="plan" value={query.plan} />
        )}
        <label className="flex flex-col gap-1.5 text-xs font-medium">
          Месец
          <select
            name="month"
            defaultValue={query.month ?? ""}
            className="border-input bg-card h-10 rounded-md border px-3 text-sm sm:w-48"
          >
            <option value="">Всички месеци</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium">
          Кон или хиподрум
          <Input
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            maxLength={60}
            placeholder="напр. Kempton"
            className="bg-card h-10"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" className="h-10">
            Търси
          </Button>
          {filtered && (
            <Link
              href={registerHref({ plan: query.plan, page: 1 })}
              className={cn(buttonVariants({ variant: "ghost" }), "h-10")}
            >
              Изчисти
            </Link>
          )}
        </div>
      </form>

      <p className="text-muted-foreground mt-5 text-sm" aria-live="polite">
        {total === 0
          ? "Няма залози по тези критерии."
          : `${total} ${total === 1 ? "залог" : "залога"}${filtered ? " по тези критерии" : ""} · страница ${query.page} от ${pages}`}
      </p>

      {rows.length > 0 && (
        <div className="border-border bg-card mt-3 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-180 text-sm">
            <thead className="text-muted-foreground border-border border-b text-[11px] tracking-widest uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-normal">
                  Дата
                </th>
                <th scope="col" className="px-4 py-3 text-left font-normal">
                  Състезание
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
                <th
                  scope="col"
                  className="px-4 py-3 text-right font-normal"
                  title="Обща печалба на плана след този залог"
                >
                  Общо
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right font-normal"
                  title="Колко е общата печалба под най-високата си точка дотогава"
                >
                  Спад
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const profit = Number(row.profit);
                const drawdown = Number(row.drawdown);
                return (
                  <tr
                    key={row.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="block font-mono text-xs">
                        {formatShortDate(row.date)}
                      </span>
                      {row.time && (
                        <span className="text-muted-foreground block font-mono text-[11px]">
                          {row.time.slice(0, 5)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{row.course}</td>
                    <td className="px-4 py-2.5 font-medium">{row.horse}</td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.odds ? Number(row.odds).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <ResultBadge result={row.result} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-mono font-semibold",
                        profit === 0 ? "text-muted-foreground" : tone(profit),
                      )}
                    >
                      {formatEurSigned(profit, { decimals: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {formatEurSigned(row.cumulative)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-mono",
                        drawdown < 0 ? "text-loss" : "text-muted-foreground",
                      )}
                    >
                      {drawdown < 0 ? formatEurSigned(drawdown) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && <Pagination query={query} pages={pages} />}
    </div>
  );
}

/** First, previous, a window around the current page, next, last. */
function Pagination({ query, pages }: { query: RegisterQuery; pages: number }) {
  const current = query.page;
  const shown = new Set(
    [1, current - 1, current, current + 1, pages].filter(
      (p) => p >= 1 && p <= pages,
    ),
  );
  const numbers = [...shown].sort((a, b) => a - b);
  const link = (page: number) => registerHref({ ...query, page });
  const item =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm";

  return (
    <nav
      aria-label="Страници"
      className="mt-6 flex flex-wrap items-center gap-1"
    >
      {current > 1 && (
        <Link href={link(current - 1)} className={cn(item, "hover:bg-muted")}>
          ← Предишна
        </Link>
      )}
      {numbers.map((page, i) => (
        <span key={page} className="flex items-center gap-1">
          {i > 0 && page - numbers[i - 1] > 1 && (
            <span aria-hidden className="text-muted-foreground px-1">
              …
            </span>
          )}
          <Link
            href={link(page)}
            aria-current={page === current ? "page" : undefined}
            className={cn(
              item,
              "font-mono",
              page === current
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {page}
          </Link>
        </span>
      ))}
      {current < pages && (
        <Link href={link(current + 1)} className={cn(item, "hover:bg-muted")}>
          Следваща →
        </Link>
      )}
    </nav>
  );
}
