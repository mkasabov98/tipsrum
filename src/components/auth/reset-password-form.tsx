"use client";

import Link from "next/link";
import { useState } from "react";

import {
  FormAlert,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";
import { type FieldErrors, useAuthForm } from "@/components/auth/use-auth-form";
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

type Values = { password: string; confirmPassword: string };

const EMPTY: Values = { password: "", confirmPassword: "" };

function validate(values: Values): FieldErrors<Values> {
  const errors: FieldErrors<Values> = {};

  if (!values.password) {
    errors.password = "Въведи парола.";
  } else {
    const problem = passwordProblem(values.password);
    if (problem) errors.password = authErrorMessage({ code: problem });
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Потвърди паролата.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Паролите не съвпадат.";
  }

  return errors;
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const { values, isValid, field } = useAuthForm(EMPTY, validate);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !isValid || pending) return;

    setServerError(null);
    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    setPending(false);

    if (error) {
      setServerError(authErrorMessage(error));
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
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="grid gap-4">
            {serverError && <FormAlert>{serverError}</FormAlert>}
            <TextField
              id="password"
              label="Нова парола"
              type="password"
              autoComplete="new-password"
              hint="Поне 8 символа, с главна и малка буква, цифра и символ."
              {...field("password")}
            />
            <TextField
              id="confirmPassword"
              label="Потвърди паролата"
              type="password"
              autoComplete="new-password"
              {...field("confirmPassword")}
            />
          </CardContent>
          <CardFooter className="mt-6">
            <SubmitButton
              disabled={!isValid}
              pending={pending}
              pendingLabel="Запазване…"
            >
              Запази паролата
            </SubmitButton>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
