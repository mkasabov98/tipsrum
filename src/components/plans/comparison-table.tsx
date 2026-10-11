import { CheckIcon } from "lucide-react";

type Row = {
  feature: string;
  free: string | boolean;
  premium: string | boolean;
};

/** Figures match the plan cards; both come from the design's stated targets. */
export const COMPARISON: readonly Row[] = [
  { feature: "Достъп до Telegram група", free: true, premium: true },
  { feature: "Прогнози на ден", free: "до 3", premium: "до 6" },
  { feature: "Целева месечна ROI", free: "14%", premium: "22%" },
  { feature: "Очаквана месечна печалба", free: "~€280", premium: "~€420" },
  { feature: "Ексклузивна Premium група", free: false, premium: true },
  { feature: "30-дневна гаранция", free: false, premium: true },
  { feature: "Цена", free: "€0", premium: "€25 / мес" },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return (
      <>
        <CheckIcon
          className="text-primary dark:text-mint mx-auto size-4"
          aria-hidden
        />
        <span className="sr-only">включено</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden className="text-muted-foreground">
          —
        </span>
        <span className="sr-only">не е включено</span>
      </>
    );
  return <span>{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="w-full min-w-120 text-sm">
        <caption className="sr-only">
          Сравнение между безплатния и Премиум плана
        </caption>
        <thead>
          <tr className="text-muted-foreground border-border border-b text-left text-[11px] tracking-widest uppercase">
            <th scope="col" className="px-5 py-3 font-normal">
              Функция
            </th>
            <th scope="col" className="px-5 py-3 text-center font-normal">
              Безплатен
            </th>
            <th
              scope="col"
              className="bg-accent/40 text-foreground dark:bg-accent/12 px-5 py-3 text-center font-medium"
            >
              Премиум
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr
              key={row.feature}
              className="border-border border-b last:border-0"
            >
              <th scope="row" className="px-5 py-3 text-left font-normal">
                {row.feature}
              </th>
              <td className="px-5 py-3 text-center">
                <Cell value={row.free} />
              </td>
              <td className="bg-accent/40 dark:bg-accent/12 px-5 py-3 text-center font-medium">
                <Cell value={row.premium} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
