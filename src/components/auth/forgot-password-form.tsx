"use client";

import Link from "next/link";
import { useState } from "react";

import {
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

type Values = { email: string };

function validate(values: Values): FieldErrors<Values> {
  const errors: FieldErrors<Values> = {};
  if (!values.email.trim()) {
    errors.email = "Въведи имейл.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = authErrorMessage({ code: "INVALID_EMAIL" });
  }
  return errors;
}

export function ForgotPasswordForm() {
  const { values, isValid, field } = useAuthForm({ email: "" }, validate);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || pending) return;

    setServerError(null);
    setPending(true);

    const { error } = await authClient.requestPasswordReset({
      email: values.email.trim(),
      redirectTo: "/reset_password",
    });

    setPending(false);
    if (error) {
      setServerError(authErrorMessage(error));
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
          </CardContent>
          <CardFooter className="mt-6">
            <SubmitButton
              disabled={!isValid}
              pending={pending}
              pendingLabel="Изпращане…"
            >
              Изпрати линк
            </SubmitButton>
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
