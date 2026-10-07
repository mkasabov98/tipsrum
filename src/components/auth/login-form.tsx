"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CheckboxField,
  EMAIL_PATTERN,
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

type Values = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const EMPTY: Values = { email: "", password: "", rememberMe: true };

function validate(values: Values): FieldErrors<Values> {
  const errors: FieldErrors<Values> = {};

  if (!values.email.trim()) {
    errors.email = "Въведи имейл.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = authErrorMessage({ code: "INVALID_EMAIL" });
  }

  // Deliberately no strength rules here: an existing password only has to be
  // entered, and checking its shape at login would tell an attacker the policy.
  if (!values.password) errors.password = "Въведи парола.";

  return errors;
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { values, isValid, field, checkbox } = useAuthForm(EMPTY, validate);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || pending) return;

    setServerError(null);
    setPending(true);

    const { error } = await authClient.signIn.email({
      email: values.email.trim(),
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (error) {
      setServerError(authErrorMessage(error));
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
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          {serverError && <FormAlert>{serverError}</FormAlert>}
          <TextField
            id="email"
            label="Имейл"
            type="email"
            autoComplete="email"
            {...field("email")}
          />
          <div className="grid gap-2">
            <TextField
              id="password"
              label="Парола"
              type="password"
              autoComplete="current-password"
              {...field("password")}
            />
            <Link
              href="/forgot_password"
              className="text-muted-foreground hover:text-foreground justify-self-end text-xs underline-offset-4 hover:underline"
            >
              Забравена парола?
            </Link>
          </div>
          <CheckboxField id="rememberMe" {...checkbox("rememberMe")}>
            Запомни ме
          </CheckboxField>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <SubmitButton
            disabled={!isValid}
            pending={pending}
            pendingLabel="Влизане…"
          >
            Влез
          </SubmitButton>
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
