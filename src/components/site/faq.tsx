import { ChevronDownIcon } from "lucide-react";

export type FaqItem = { question: string; answer: React.ReactNode };

/**
 * Native <details> accordion: open/close, keyboard support and in-page search
 * ("find in page" expands a closed <details> in modern browsers) come for free,
 * and it needs no client JavaScript.
 */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-border border-border bg-card divide-y rounded-xl border">
      {items.map((item) => (
        <details key={item.question} className="group px-5">
          <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium outline-none focus-visible:ring-3">
            {item.question}
            <ChevronDownIcon
              aria-hidden
              className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="prose pb-5 text-sm">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
