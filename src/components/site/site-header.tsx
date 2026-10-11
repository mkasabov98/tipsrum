"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { MAIN_NAV, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  // Closed on link click rather than in an effect on pathname, which React 19
  // (rightly) flags as setting state during render.
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="bg-card border-border border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="shrink-0"
          aria-label={`${SITE_NAME} — начало`}
        >
          <Image
            src="/logo.png"
            alt={SITE_NAME}
            width={1164}
            height={234}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav aria-label="Основна навигация" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/my_account"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden h-9 px-4 sm:inline-flex",
              )}
            >
              Акаунт
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "hidden h-9 px-4 sm:inline-flex",
                )}
              >
                Вход
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden h-9 px-4 sm:inline-flex",
                )}
              >
                Започни безплатно
              </Link>
            </>
          )}
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

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Мобилна навигация"
          className="border-border border-t md:hidden"
        >
          <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-3 text-sm",
                    isActive(item.href)
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 grid gap-2">
              {isAuthenticated ? (
                <Link
                  href="/my_account"
                  onClick={close}
                  className={cn(buttonVariants(), "h-10")}
                >
                  Акаунт
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-10",
                    )}
                  >
                    Вход
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    className={cn(buttonVariants(), "h-10")}
                  >
                    Започни безплатно
                  </Link>
                </>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
