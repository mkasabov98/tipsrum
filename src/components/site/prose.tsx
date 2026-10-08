import { cn } from "@/lib/utils";

/**
 * Renders ported page copy. The HTML comes from our own content files, sanitised
 * when it was imported, never from user input.
 */
export function Prose({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
