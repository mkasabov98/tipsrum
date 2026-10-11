"use client";

import { useState } from "react";

import {
  FormAlert,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";
import { type FieldErrors, useAuthForm } from "@/components/auth/use-auth-form";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "@/app/kontakti/actions";
import { MESSAGE_MAX_LENGTH, validateContact } from "@/lib/contact";

type Values = {
  name: string;
  email: string;
  message: string;
  /** Honeypot; hidden from people. */
  website: string;
};

const EMPTY: Values = { name: "", email: "", message: "", website: "" };

const validate = (values: Values): FieldErrors<Values> =>
  validateContact(values);

export function ContactForm() {
  const { values, isValid, field, setValue, touch } = useAuthForm(
    EMPTY,
    validate,
  );
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const messageField = field("message");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || pending) return;

    setServerError(null);
    setPending(true);
    const result = await submitContactForm({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      website: values.website,
    });
    setPending(false);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <FormAlert tone="success">
        Благодарим! Получихме съобщението ти и ще се свържем с теб възможно
        най-скоро.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      {serverError && <FormAlert>{serverError}</FormAlert>}
      <TextField id="name" label="Име" autoComplete="name" {...field("name")} />
      <TextField
        id="email"
        label="Имейл адрес"
        type="email"
        autoComplete="email"
        {...field("email")}
      />

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="message">Съобщение</Label>
          <span
            className="text-muted-foreground text-xs"
            aria-live="polite"
            aria-atomic="true"
          >
            {values.message.length} / {MESSAGE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          onBlur={() => touch("message")}
          aria-invalid={!!messageField.error}
          aria-describedby={messageField.error ? "message-error" : undefined}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 w-full rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3 md:text-sm"
        />
        {messageField.error && (
          <p
            id="message-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {messageField.error}
          </p>
        )}
      </div>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Не попълвай това поле</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValue("website", event.target.value)}
        />
      </div>

      <SubmitButton
        disabled={!isValid}
        pending={pending}
        pendingLabel="Изпращане…"
      >
        Изпратете съобщението
      </SubmitButton>
    </form>
  );
}
