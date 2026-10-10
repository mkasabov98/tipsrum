/**
 * Money formatting for a Bulgarian audience: space thousands separator and a
 * comma decimal mark, with the euro sign in front as the design shows it
 * (€16 135). Prices are euro-only - Bulgaria adopted the euro in January 2026.
 */
const nf = (decimals: number) =>
  new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
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
  return `${n > 0 ? "+" : ""}${Math.round(n)}%`;
}
