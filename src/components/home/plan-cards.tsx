import { CheckIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Plan = {
  name: string;
  price: string;
  period: string;
  roiLine: string;
  features: readonly string[];
  cta: { href: string; label: string };
  /** Quiet link to the plan page, so both cards offer the same two routes:
   *  act now, or read the detail first. */
  detail: { href: string; label: string };
  recommended?: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    name: "Безплатен",
    price: "€0",
    period: "завинаги",
    roiLine: "Целева месечна ROI · 14%",
    features: [
      "До 3 внимателно анализирани прогнози",
      "Достъп до Telegram групата",
      "Очаквана месечна печалба ~€280",
      "Нулев риск · без банкови данни",
    ],
    cta: { href: "/register", label: "Влез безплатно" },
    detail: { href: "/free", label: "Повече за плана" },
  },
  {
    name: "Премиум",
    price: "€25",
    period: "месец",
    roiLine: "Целева месечна ROI · 22%",
    features: [
      "До 6 внимателно анализирани прогнози",
      "Ексклузивна Premium група",
      "Очаквана месечна печалба ~€420",
      "30-дневна гаранция на парите",
    ],
    // Checkout arrives in Phase 6; until then the Premium funnel also starts
    // with an account, exactly as the button on /premium does.
    cta: { href: "/register", label: "Стани Премиум" },
    detail: { href: "/premium", label: "Повече за плана" },
    recommended: true,
  },
];

export function PlanCards({ plans = PLANS }: { plans?: readonly Plan[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative rounded-xl border p-6",
            plan.recommended
              ? "border-primary/40 bg-accent/60 shadow-sm"
              : "border-border bg-card",
          )}
        >
          {plan.recommended && (
            <span className="bg-primary text-primary-foreground absolute -top-3 right-5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase">
              Препоръчано
            </span>
          )}
          <p className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
            {plan.name}
          </p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {plan.price}
            </span>
            <span className="text-muted-foreground text-sm">
              / {plan.period}
            </span>
          </p>
          <p className="text-primary mt-3 text-sm font-medium">
            {plan.roiLine}
          </p>
          <ul className="mt-6 grid gap-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckIcon
                  className="text-primary mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href={plan.cta.href}
            className={cn(
              buttonVariants({
                variant: plan.recommended ? "default" : "outline",
              }),
              "mt-7 h-10 w-full",
            )}
          >
            {plan.cta.label}
          </Link>
          <Link
            href={plan.detail.href}
            className="text-muted-foreground hover:text-foreground mt-3 block text-center text-xs underline-offset-4 hover:underline"
          >
            {plan.detail.label} →
          </Link>
        </div>
      ))}
    </div>
  );
}
