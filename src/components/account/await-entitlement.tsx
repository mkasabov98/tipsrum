"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

/**
 * Rendered only while a just-paid account is still free: re-renders the page
 * every two seconds until the webhook has granted premium (the server then
 * stops rendering this), giving up after half a minute.
 */
export function AwaitEntitlement() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) clearInterval(timer);
      else router.refresh();
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
