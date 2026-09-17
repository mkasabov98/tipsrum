"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CheckboxField,
  FormAlert,
  TextField,
} from "@/components/auth/form-parts";
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

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);

    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
      rememberMe,
    });

    if (error) {
      setError(authErrorMessage(error));
      setPending(false);
      return;
    }
    // Stay pending through navigation so the form can't be submitted twice.
    router.replace(redirectTo);
    router.refresh();
  }

  const registerHref =
    redirectTo === "/my_account"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Вход</CardTitle>
        <CardDescription>Влез в профила си в Tipsrum.</CardDescription>
      </CardHeader>
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
          <div className="grid gap-2">
            <TextField
              id="password"
              label="Парола"
              type="password"
              autoComplete="current-password"
              required
            />
            <Link
              href="/forgot_password"
              className="text-muted-foreground hover:text-foreground justify-self-end text-xs underline-offset-4 hover:underline"
            >
              Забравена парола?
            </Link>
          </div>
          <CheckboxField
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          >
            Запомни ме
          </CheckboxField>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Влизане…" : "Влез"}
          </Button>
          <p className="text-muted-foreground text-sm">
            Нямаш профил?{" "}
            <Link
              href={registerHref}
              className="text-primary underline-offset-4 hover:underline"
            >
              Регистрирай се
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
