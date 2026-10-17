"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

/** The bot asks for the registered email, so the page offers it ready to copy. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address is still visible to copy by hand.
    }
  }

  return (
    <div className="border-border bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <span className="truncate font-mono text-sm">{email}</span>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? "Копирано" : "Копирай"}
      </Button>
    </div>
  );
}
