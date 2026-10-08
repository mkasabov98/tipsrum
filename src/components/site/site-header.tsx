"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { MAIN_NAV, SITE_NAME, type NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  if (pathname === item.href) return true;
  return item.children?.some((child) => child.href === pathname) ?? false;
}

export function SiteHeader() {
  const pathname = usePathname();
  // Closed on link click rather than in an effect on pathname, which React 19
  // (rightly) flags as setting state during render.
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="border-border/60 bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-16">
        <Link
          href="/"
          className="text-primary text-base font-extrabold tracking-widest uppercase"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Основна навигация" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item) ? "page" : undefined}
                  className={cn(
                    "hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(pathname, item)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  // Opens on hover and on keyboard focus, so it works without JS.
                  <ul className="border-border bg-card invisible absolute top-full left-0 min-w-40 rounded-lg border p-1 opacity-0 shadow-lg transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={
                            pathname === child.href ? "page" : undefined
                          }
                          className="hover:bg-muted text-muted-foreground hover:text-foreground block rounded-md px-3 py-2 text-sm"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/my_account"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Акаунт
          </Link>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Затвори менюто" : "Отвори менюто"}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -mr-1 rounded-md p-2 outline-none focus-visible:ring-3 md:hidden"
          >
            {open ? (
              <XIcon className="size-5" aria-hidden="true" />
            ) : (
              <MenuIcon className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation: a flat list, so the Планове children stay reachable. */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Мобилна навигация"
          className="border-border/60 border-t md:hidden"
        >
          <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {MAIN_NAV.flatMap((item) => [item, ...(item.children ?? [])]).map(
              (item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-3 text-sm font-medium",
                      pathname === item.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <Link
                href="/my_account"
                onClick={close}
                className="text-primary block rounded-md px-3 py-3 text-sm font-semibold"
              >
                Акаунт
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
