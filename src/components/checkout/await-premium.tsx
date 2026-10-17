"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

/**
 * Shown while a just-paid account is still free. Asks the server every two seconds
 * whether the Stripe webhook has granted premium and re-renders the page as soon as
 * it has. After half a minute it stops and tells the user who to contact.
 */
export function AwaitPremium() {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let stopped = false;

    const timer = setInterval(async () => {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(timer);
        setTimedOut(true);
        return;
      }
      try {
        const res = await fetch("/api/entitlement-status", {
          cache: "no-store",
        });
        if (!res.ok || stopped) return;
        const { entitlement } = (await res.json()) as { entitlement?: string };
        if (entitlement === "premium") {
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        // A dropped request is retried on the next tick.
      }
    }, INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [router]);

  if (!timedOut) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Плащането е получено. Отнема няколко секунди, страницата ще се обнови
        сама.
      </p>
    );
  }

  return (
    <p className="text-sm" role="alert">
      Обработката отнема повече от обичайното. Плащането ти е получено и няма
      нужда да плащаш отново. Обнови страницата след минута или{" "}
      <Link href="/kontakti" className="text-primary underline">
        се свържи с нас
      </Link>
      .
    </p>
  );
}
