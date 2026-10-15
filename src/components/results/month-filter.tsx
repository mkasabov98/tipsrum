"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonth } from "@/lib/format";
import { resultsHref, type ResultsQuery } from "@/lib/results-query";
import { cn } from "@/lib/utils";

// Base UI items need a non-empty value; "all" maps back to no filter.
const ALL = "all";

/**
 * The register's month filter: a styled select in place of the native one,
 * whose open list the browser draws and no CSS can reach. Picking a month
 * applies straight away; the hidden input keeps it in the surrounding GET form
 * too, so "Търси" after typing a search still sends the month along.
 */
export function MonthFilter({
  query,
  months,
}: {
  query: ResultsQuery;
  months: readonly string[];
}) {
  const router = useRouter();
  const labelId = useId();
  const [value, setValue] = useState(query.month ?? ALL);
  const [pending, startTransition] = useTransition();

  const items = [
    { value: ALL, label: "Всички месеци" },
    ...months.map((month) => ({ value: month, label: formatMonth(month) })),
  ];

  function choose(next: string | null) {
    const month = next && next !== ALL ? next : undefined;
    setValue(month ?? ALL);
    startTransition(() => {
      router.push(resultsHref({ ...query, month, page: 1 }, "register"));
    });
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs font-medium">
      <span id={labelId}>Месец</span>
      <input type="hidden" name="month" value={value === ALL ? "" : value} />
      <Select items={items} value={value} onValueChange={choose}>
        <SelectTrigger
          aria-labelledby={labelId}
          className={cn(
            "bg-card w-full rounded-md px-3 text-sm font-normal data-[size=default]:h-10 sm:w-52",
            pending && "opacity-70",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          className="max-h-80"
        >
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="py-2">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
