import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = { href: string; label: string };

/**
 * Closing band shared by the plan pages and the blog.
 *
 * Deliberately light: the footer is a dark band, so a dark CTA above it read as
 * one continuous slab. A soft panel on the light ground separates the two, and
 * on the plan pages it also breaks up the dark results section above it.
 */
export function CtaBand({
  title,
  lead,
  primary,
  secondary,
}: {
  title: string;
  lead?: string;
  primary: Action;
  secondary?: Action;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <div className="border-primary/15 bg-accent rounded-2xl border px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {lead && <p className="text-muted-foreground mt-4">{lead}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={primary.href}
              className={cn(buttonVariants(), "h-11 px-5")}
            >
              {primary.label}
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-card h-11 px-5",
                )}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
