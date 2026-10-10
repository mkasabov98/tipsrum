import { cn } from "@/lib/utils";

/**
 * Edge-to-edge infinite scroller. Content is rendered twice and the track
 * slides exactly half its width, so the loop never shows a seam.
 *
 * Pure CSS: no JS, nothing to hydrate, and it pauses on hover or keyboard
 * focus. With prefers-reduced-motion the animation stops and the row turns
 * into an ordinary horizontal scroller, so nothing becomes unreachable.
 */
export function Marquee({
  children,
  durationSeconds = 40,
  className,
  trackClassName,
}: {
  children: React.ReactNode;
  durationSeconds?: number;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div
      className={cn("marquee relative w-full overflow-hidden", className)}
      style={
        { "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties
      }
    >
      <div className={cn("marquee-track flex w-max", trackClassName)}>
        <div className="flex shrink-0 items-center">{children}</div>
        {/* Second copy is decorative: it exists only so the loop is seamless. */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
