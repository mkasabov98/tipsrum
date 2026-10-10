import Link from "next/link";

import { cn } from "@/lib/utils";

export type Crumb = { href: string; label: string };

/**
 * Sub-page layout from the design: a dark hero band carrying the breadcrumb,
 * eyebrow, title and lead, followed by the page body on the light ground.
 */
export function PageShell({
  title,
  eyebrow,
  lead,
  crumbs,
  children,
  width = "prose",
}: {
  title: string;
  eyebrow?: string;
  lead?: string;
  crumbs?: readonly Crumb[];
  children: React.ReactNode;
  width?: "prose" | "wide";
}) {
  const inner =
    width === "wide" ? "mx-auto w-full max-w-6xl" : "mx-auto w-full max-w-3xl";

  return (
    <main className="flex-1">
      <div className="dark bg-background text-foreground">
        <div className={cn(inner, "px-4 py-12 sm:py-16")}>
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Път до страницата" className="mb-5">
              <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                {crumbs.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden>/</span>}
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
              {lead}
            </p>
          )}
        </div>
      </div>

      <div className={cn(inner, "px-4 py-10 sm:py-14")}>{children}</div>
    </main>
  );
}

/** Letter-spaced caps label with a leading rule, used above every section. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase">
      <span aria-hidden className="bg-brand-soft h-px w-6" />
      {children}
    </p>
  );
}

/** Full-width band using the dark palette, for results and CTA sections. */
export function DarkSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("dark bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        {children}
      </div>
    </section>
  );
}
