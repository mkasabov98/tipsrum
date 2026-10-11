import Link from "next/link";

import { cn } from "@/lib/utils";

export type Crumb = { href: string; label: string };

type Width = "prose" | "wide";

const inner = (width: Width) =>
  width === "wide" ? "mx-auto w-full max-w-6xl" : "mx-auto w-full max-w-3xl";

/**
 * The dark hero band at the top of every sub-page: breadcrumb, eyebrow, title
 * and lead. Pages that need full-bleed bands below it (the plan pages) compose
 * this directly; pages that are just a column of copy use PageShell.
 */
export function PageHero({
  title,
  eyebrow,
  lead,
  crumbs,
  width = "prose",
  children,
}: {
  title: string;
  eyebrow?: string;
  lead?: string;
  crumbs?: readonly Crumb[];
  width?: Width;
  children?: React.ReactNode;
}) {
  return (
    <div className="dark bg-background text-foreground">
      <div className={cn(inner(width), "px-4 py-12 sm:py-16")}>
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
        {children}
      </div>
    </div>
  );
}

/** PageHero followed by a single column of page body - the legal pages' shape. */
export function PageShell({
  children,
  width = "prose",
  ...hero
}: React.ComponentProps<typeof PageHero> & { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <PageHero {...hero} width={width} />
      <div className={cn(inner(width), "px-4 py-10 sm:py-14")}>{children}</div>
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
