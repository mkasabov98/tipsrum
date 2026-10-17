"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

/** Submit button for a server-action form; locks while the redirect is prepared. */
export function ActionButton({
  children,
  pendingLabel,
  variant = "default",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
