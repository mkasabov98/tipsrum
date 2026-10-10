import { cn } from "@/lib/utils";

export type MarqueeCopy = "primary" | "clone";

/**
 * Edge-to-edge infinite scroller. Content is rendered twice and the track
 * slides exactly half its width, so the loop never shows a seam.
 *
 * Pure CSS: no JS, nothing to hydrate. It pauses on hover and keyboard focus,
 * and with prefers-reduced-motion the animation stops and the row becomes an
 * ordinary horizontal scroller so nothing is unreachable.
 *
 * `children` may be a function of which copy is being rendered. Interactive
 * content needs that: the clone must stay clickable (it is on screen for half
 * the loop) while being skipped by the tab order and assistive tech, so pass
 * tabIndex -1 for the clone rather than marking the whole copy inert.
 */
export function Marquee({
  children,
  durationSeconds = 40,
  className,
  trackClassName,
}: {
  children: React.ReactNode | ((copy: MarqueeCopy) => React.ReactNode);
  durationSeconds?: number;
  className?: string;
  trackClassName?: string;
}) {
  const render = (copy: MarqueeCopy) =>
    typeof children === "function" ? children(copy) : children;

  return (
    <div
      className={cn("marquee relative w-full overflow-hidden", className)}
      style={
        { "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties
      }
    >
      <div className={cn("marquee-track flex w-max", trackClassName)}>
        <div className="flex shrink-0 items-center">{render("primary")}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {render("clone")}
        </div>
      </div>
    </div>
  );
}
