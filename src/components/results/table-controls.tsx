import Link from "next/link";

import { cn } from "@/lib/utils";

const item =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm";

/**
 * Page links under a table: previous, first, a window around the current
 * page, last, next. Plain links, so paging works without client JavaScript.
 */
export function Pagination({
  current,
  pages,
  hrefFor,
  label,
}: {
  current: number;
  pages: number;
  hrefFor: (page: number) => string;
  label: string;
}) {
  if (pages <= 1) return null;

  const numbers = [
    ...new Set(
      [1, current - 1, current, current + 1, pages].filter(
        (p) => p >= 1 && p <= pages,
      ),
    ),
  ].sort((a, b) => a - b);

  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-1">
      {current > 1 && (
        <Link
          href={hrefFor(current - 1)}
          className={cn(item, "hover:bg-muted")}
        >
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
            href={hrefFor(page)}
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
        <Link
          href={hrefFor(current + 1)}
          className={cn(item, "hover:bg-muted")}
        >
          Следваща →
        </Link>
      )}
    </nav>
  );
}

/**
 * "Редове: 10 · 20 · 50" - rows-per-page as links rather than a select, so it
 * applies on click with no JavaScript and no submit button.
 */
export function RowsPicker({
  options,
  current,
  hrefFor,
}: {
  options: readonly number[];
  current: number;
  hrefFor: (rows: number) => string;
}) {
  return (
    <div className="flex items-center gap-1 text-sm sm:ml-auto">
      <span className="text-muted-foreground mr-1">Редове:</span>
      {options.map((rows) => (
        <Link
          key={rows}
          href={hrefFor(rows)}
          aria-current={rows === current ? "true" : undefined}
          aria-label={`${rows} реда на страница`}
          className={cn(
            item,
            "font-mono",
            rows === current
              ? "bg-muted text-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {rows}
        </Link>
      ))}
    </div>
  );
}

/** Pagination on the left, page size on the right; stacks on phones. */
export function TableFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
