/**
 * Plan identifiers and labels, kept free of database imports so client
 * components (the results filters) can use them alongside server code.
 */
export type Plan = "free" | "premium";

export const PLANS: readonly Plan[] = ["premium", "free"];

export const PLAN_LABELS: Record<Plan, string> = {
  premium: "Премиум",
  free: "Безплатен",
};
