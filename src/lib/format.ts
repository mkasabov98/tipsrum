/**
 * Money formatting for a Bulgarian audience: space thousands separator and a
 * comma decimal mark, with the euro sign in front as the design shows it
 * (€16 135). Prices are euro-only - Bulgaria adopted the euro in January 2026.
 */
const nf = (decimals: number) =>
  new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // bg-BG skips grouping for 4-digit numbers by default ("€3860"), which
    // reads inconsistently beside "€14 188" in the same column.
    useGrouping: "always",
  });

export function formatEur(
  amount: number | string,
  { decimals = 0 }: { decimals?: number } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "—";
  // Intl uses a narrow no-break space for bg-BG grouping; keep it, it renders
  // exactly like the design's thin gap.
  return `€${nf(decimals).format(value)}`;
}

/** Same, but always signed - used for profit figures in the results tables. */
export function formatEurSigned(
  amount: number | string,
  options?: { decimals?: number },
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatEur(Math.abs(value), options)}`;
}

export function formatPercent(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  // True minus sign, matching formatEurSigned in the same rows.
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  return `${sign}${Math.abs(rounded)}%`;
}

/** Long Bulgarian date for article bylines: "18 януари 2025 г." */
export function formatDate(value: Date | string | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * "2026-05" to "Май 2026", for the month-by-month results. Capitalised
 * because it always stands alone as a row or option label; the full year is
 * kept since "Май 26" reads as the 26th of May.
 */
export function formatMonth(month: string): string {
  const [year, index] = month.split("-").map(Number);
  if (!year || !index) return month;
  const label = new Intl.DateTimeFormat("bg-BG", { month: "long" }).format(
    new Date(Date.UTC(year, index - 1, 1)),
  );
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}

/** Compact numeric date for table rows: "05.10.2026". */
export function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

// Fixed three-letter forms: Intl's bg-BG "short" months vary in length and
// carry a trailing dot, which is too ragged for a ticker or an axis.
const MONTH_SHORT = [
  "яну",
  "фев",
  "мар",
  "апр",
  "май",
  "юни",
  "юли",
  "авг",
  "сеп",
  "окт",
  "ное",
  "дек",
];

/** Short month label for chart axes and the ticker: "2026-05" to "май 26". */
export function formatMonthShort(month: string): string {
  const [year, index] = month.split("-");
  const label = MONTH_SHORT[Number(index) - 1];
  return label && year ? `${label} ${year.slice(2)}` : month;
}
