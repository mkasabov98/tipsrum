import Link from "next/link";

import { ResultBadge } from "@/components/results/result-badge";
import {
  Pagination,
  RowsPicker,
  TableFooter,
} from "@/components/results/table-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEurSigned, formatMonth, formatShortDate } from "@/lib/format";
import type { RegisterRow } from "@/lib/results";
import {
  BET_ROWS,
  hiddenParams,
  resultsHref,
  type ResultsQuery,
} from "@/lib/results-query";
import { cn } from "@/lib/utils";

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
  query: ResultsQuery;
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
        {/* Keep the plan, page size and the monthly table's position;
            a new search starts the register again from page 1. */}
        {hiddenParams(query, ["plan", "rows", "mpage", "mrows"]).map(
          ([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ),
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
              href={resultsHref(
                { ...query, month: undefined, q: undefined, page: 1 },
                "register",
              )}
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

      {total > 0 && (
        <TableFooter>
          <RowsPicker
            options={BET_ROWS}
            current={query.rows}
            hrefFor={(rows) =>
              resultsHref({ ...query, rows, page: 1 }, "register")
            }
          />
          <Pagination
            label="Страници на залозите"
            current={query.page}
            pages={pages}
            hrefFor={(page) => resultsHref({ ...query, page }, "register")}
          />
        </TableFooter>
      )}
    </div>
  );
}
