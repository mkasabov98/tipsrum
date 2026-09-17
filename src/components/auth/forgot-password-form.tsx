"use client";

import Link from "next/link";
import { useState } from "react";

import { FormAlert, TextField } from "@/components/auth/form-parts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);

    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/reset_password",
    });

    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSent(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Забравена парола</CardTitle>
        <CardDescription>
          Въведи имейла си и ще ти изпратим линк за нова парола.
        </CardDescription>
      </CardHeader>
      {sent ? (
        <CardContent>
          {/* Same message whether or not the email exists, so the form can't be
              used to discover who has an account. */}
          <FormAlert tone="success">
            Ако има профил с този имейл, до няколко минути ще получиш линк за
            нова парола.
          </FormAlert>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && <FormAlert>{error}</FormAlert>}
            <TextField
              id="email"
              label="Имейл"
              type="email"
              autoComplete="email"
              required
            />
          </CardContent>
          <CardFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Изпращане…" : "Изпрати линк"}
            </Button>
          </CardFooter>
        </form>
      )}
      <CardFooter className={sent ? "" : "pt-0"}>
        <Link
          href="/login"
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          Обратно към вход
        </Link>
      </CardFooter>
    </Card>
  );
}
