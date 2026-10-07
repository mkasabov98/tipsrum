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
import { passwordProblem } from "@/lib/password";

const inlineLink = "text-sm text-primary underline-offset-4 hover:underline";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password"));

    const problem = passwordProblem(newPassword);
    if (problem) {
      return setError(authErrorMessage({ code: problem }));
    }
    if (newPassword !== form.get("confirmPassword")) {
      return setError("Паролите не съвпадат.");
    }

    setError(null);
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setPending(false);

    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Нова парола</CardTitle>
        </CardHeader>
        <CardContent>
          <FormAlert>{authErrorMessage({ code: "INVALID_TOKEN" })}</FormAlert>
        </CardContent>
        <CardFooter>
          <Link href="/forgot_password" className={inlineLink}>
            Поискай нов линк
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Нова парола</CardTitle>
        {!done && (
          <CardDescription>Избери нова парола за профила си.</CardDescription>
        )}
      </CardHeader>
      {done ? (
        <>
          <CardContent>
            <FormAlert tone="success">
              Паролата е сменена. Излязохме от профила ти на всички устройства —
              влез отново с новата парола.
            </FormAlert>
          </CardContent>
          <CardFooter>
            <Link href="/login" className={inlineLink}>
              Към вход
            </Link>
          </CardFooter>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && <FormAlert>{error}</FormAlert>}
            <TextField
              id="password"
              label="Нова парола"
              type="password"
              autoComplete="new-password"
              hint="Поне 8 символа, с главна и малка буква, цифра и символ."
              required
              minLength={8}
            />
            <TextField
              id="confirmPassword"
              label="Потвърди паролата"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </CardContent>
          <CardFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Запазване…" : "Запази паролата"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
