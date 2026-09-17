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
import { isValidUsername } from "@/lib/username";

const inlineLink = "text-primary underline-offset-4 hover:underline";

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username")).trim();
    const password = String(form.get("password"));

    // Client-side checks give instant feedback; the server enforces all of them again.
    if (!isValidUsername(username)) {
      return setError(authErrorMessage({ code: "INVALID_USERNAME" }));
    }
    if (password.length < 8) {
      return setError(authErrorMessage({ code: "PASSWORD_TOO_SHORT" }));
    }
    if (password !== form.get("confirmPassword")) {
      return setError("Паролите не съвпадат.");
    }
    if (!termsAccepted) {
      return setError(authErrorMessage({ code: "TERMS_NOT_ACCEPTED" }));
    }

    setError(null);
    setPending(true);

    const { error } = await authClient.signUp.email({
      name: username,
      username,
      email: String(form.get("email")),
      password,
      marketingOptIn,
      // Not stored as-is: the server checks it and stamps termsAcceptedAt itself.
      termsAccepted: true,
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (error) {
      setError(authErrorMessage(error));
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
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && <FormAlert>{error}</FormAlert>}
          <TextField
            id="username"
            label="Потребителско име"
            autoComplete="username"
            hint="3–30 символа: латински букви, цифри, точка, долна черта или тире."
            required
            minLength={3}
            maxLength={30}
          />
          <TextField
            id="email"
            label="Имейл"
            type="email"
            autoComplete="email"
            required
          />
          <TextField
            id="password"
            label="Парола"
            type="password"
            autoComplete="new-password"
            hint="Поне 8 символа."
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
          <CheckboxField
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={setTermsAccepted}
          >
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
          <CheckboxField
            id="marketingOptIn"
            checked={marketingOptIn}
            onCheckedChange={setMarketingOptIn}
          >
            Искам да получавам безплатни прогнози, оферти и новини по имейл.
          </CheckboxField>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Регистриране…" : "Регистрирай се"}
          </Button>
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
