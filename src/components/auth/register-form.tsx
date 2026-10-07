"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CheckboxField,
  EMAIL_PATTERN,
  FormAlert,
  PasswordField,
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

const inlineLink = "text-primary underline-offset-4 hover:underline";

type Values = {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  // Optional by design: never part of validation.
  marketingOptIn: boolean;
};

const EMPTY: Values = {
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  marketingOptIn: false,
};

function validate(values: Values): FieldErrors<Values> {
  const errors: FieldErrors<Values> = {};

  if (!values.email.trim()) {
    errors.email = "Въведи имейл.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = authErrorMessage({ code: "INVALID_EMAIL" });
  }

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

  if (!values.termsAccepted) {
    errors.termsAccepted = authErrorMessage({ code: "TERMS_NOT_ACCEPTED" });
  }

  return errors;
}

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { values, isValid, field, checkbox } = useAuthForm(EMPTY, validate);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || pending) return;

    setServerError(null);
    setPending(true);

    const email = values.email.trim();
    const { error } = await authClient.signUp.email({
      // Required by Better-Auth, but the server derives the stored name from
      // the email itself, so this value is never trusted.
      name: email,
      email,
      password: values.password,
      marketingOptIn: values.marketingOptIn,
      // Not stored as-is: the server checks it and stamps termsAcceptedAt itself.
      termsAccepted: true,
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (error) {
      setServerError(authErrorMessage(error));
      setPending(false);
      return;
    }
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Регистрация</CardTitle>
        <CardDescription>
          Безплатно е и отнема по-малко от 30 секунди.
        </CardDescription>
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
          <PasswordField
            id="password"
            label="Парола"
            autoComplete="new-password"
            hint="Поне 8 символа, с главна и малка буква, цифра и символ."
            {...field("password")}
          />
          <PasswordField
            id="confirmPassword"
            label="Потвърди паролата"
            autoComplete="new-password"
            {...field("confirmPassword")}
          />
          <CheckboxField id="termsAccepted" {...checkbox("termsAccepted")}>
            <span>
              Приемам{" "}
              <Link href="/obshti-usloviya" className={inlineLink}>
                Общите условия
              </Link>{" "}
              и{" "}
              <Link href="/gdpr" className={inlineLink}>
                Политиката за поверителност
              </Link>
              .
            </span>
          </CheckboxField>
          <CheckboxField id="marketingOptIn" {...checkbox("marketingOptIn")}>
            Искам да получавам безплатни прогнози, оферти и новини по имейл.
          </CheckboxField>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <SubmitButton
            disabled={!isValid}
            pending={pending}
            pendingLabel="Регистриране…"
          >
            Регистрирай се
          </SubmitButton>
          <p className="text-muted-foreground text-sm">
            Вече имаш профил?{" "}
            <Link href="/login" className={inlineLink}>
              Влез
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
