import { PLANS, type Plan } from "@/lib/results";

/**
 * The /rezultati view state, all of it in the URL so every view - filters,
 * pages and page sizes of both tables - can be linked and survives the back
 * button. Two independent tables share the URL, so the monthly table's params
 * are prefixed with "m".
 */
export type ResultsQuery = {
  plan: Plan;
  /** Bet register: month filter, search, page, rows per page. */
  month?: string;
  q?: string;
  page: number;
  rows: number;
  /** Monthly summary: page and rows per page. */
  mpage: number;
  mrows: number;
};

export const BET_ROWS = [20, 50, 100] as const;
export const MONTH_ROWS = [10, 20, 50] as const;

const DEFAULTS = {
  plan: "premium",
  page: 1,
  rows: BET_ROWS[0],
  mpage: 1,
  mrows: MONTH_ROWS[0],
} as const;

type Params = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const positiveInt = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
};

/** One of the allowed page sizes, or the default - never an arbitrary LIMIT. */
const pick = (value: string | undefined, allowed: readonly number[]) => {
  const n = Number(value);
  return allowed.includes(n) ? n : allowed[0];
};

/**
 * Query params are user input: anything unrecognised falls back to the
 * default rather than erroring, so a mangled shared link still opens.
 */
export function parseResultsQuery(params: Params): ResultsQuery {
  const plan = one(params.plan);
  const month = one(params.month);
  const q = one(params.q)?.trim().slice(0, 60);
  return {
    plan: PLANS.includes(plan as Plan) ? (plan as Plan) : DEFAULTS.plan,
    month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : undefined,
    q: q || undefined,
    page: positiveInt(one(params.page), DEFAULTS.page),
    rows: pick(one(params.rows), BET_ROWS),
    mpage: positiveInt(one(params.mpage), DEFAULTS.mpage),
    mrows: pick(one(params.mrows), MONTH_ROWS),
  };
}

/**
 * A /rezultati link for the given state, dropping defaults so URLs stay
 * short. `anchor` scrolls back to the table the link controls.
 */
export function resultsHref(
  query: Partial<ResultsQuery> & { plan: Plan },
  anchor?: "months" | "register",
): string {
  const params = new URLSearchParams();
  if (query.plan !== DEFAULTS.plan) params.set("plan", query.plan);
  if (query.month) params.set("month", query.month);
  if (query.q) params.set("q", query.q);
  if (query.page && query.page !== DEFAULTS.page)
    params.set("page", String(query.page));
  if (query.rows && query.rows !== DEFAULTS.rows)
    params.set("rows", String(query.rows));
  if (query.mpage && query.mpage !== DEFAULTS.mpage)
    params.set("mpage", String(query.mpage));
  if (query.mrows && query.mrows !== DEFAULTS.mrows)
    params.set("mrows", String(query.mrows));
  const search = params.toString();
  return `/rezultati${search ? `?${search}` : ""}${anchor ? `#${anchor}` : ""}`;
}

/** The non-default params a GET form must carry so submitting keeps them. */
export function hiddenParams(
  query: ResultsQuery,
  keys: readonly ("plan" | "rows" | "mpage" | "mrows")[],
): [string, string][] {
  return keys
    .filter((key) => query[key] !== DEFAULTS[key])
    .map((key) => [key, String(query[key])]);
}
