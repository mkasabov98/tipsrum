import Link from "next/link";

import { DarkSection } from "@/components/site/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = { href: string; label: string };

/** Closing band shared by the plan pages and the blog. */
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
    <DarkSection>
      <div className="mx-auto max-w-2xl text-center">
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
                "h-11 px-5",
              )}
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </DarkSection>
  );
}
