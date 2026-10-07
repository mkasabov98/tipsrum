"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The button's default disabled style is 50% opacity, which on the near-black
 * card makes it vanish. A muted fill with a border keeps it clearly visible as
 * a button that simply isn't ready yet.
 */
export function SubmitButton({
  disabled,
  pending,
  pendingLabel,
  children,
}: {
  disabled: boolean;
  pending: boolean;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      className="w-full disabled:border-white/25 disabled:bg-white/15 disabled:text-white/70 disabled:opacity-100"
      disabled={disabled || pending}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string | null;
  children: React.ReactNode;
};

export function CheckboxField({
  id,
  checked,
  onCheckedChange,
  error,
  children,
}: CheckboxFieldProps) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1">
      <div className="flex items-start gap-2">
        {/* Base UI puts `id` on a hidden input, not the visible checkbox, so
            htmlFor alone leaves the checkbox unnamed for screen readers. */}
        <Checkbox
          id={id}
          aria-labelledby={labelId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <Label id={labelId} htmlFor={id} className="leading-snug font-normal">
          {children}
        </Label>
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

type TextFieldProps = React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  /** Rendered inside the field, against its right edge. */
  trailing?: React.ReactNode;
};

export function TextField({
  id,
  label,
  hint,
  error,
  trailing,
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={trailing ? "pr-9" : undefined}
          {...inputProps}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

/**
 * Password field with a show/hide toggle. The toggle is a real button so it is
 * keyboard reachable, but it preventDefaults mousedown so clicking it doesn't
 * pull focus out of the input - otherwise the field would blur and show its
 * error just because someone wanted to check what they typed.
 */
export function PasswordField(
  props: Omit<TextFieldProps, "trailing" | "type">,
) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOffIcon : EyeIcon;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Скрий паролата" : "Покажи паролата"}
          aria-pressed={visible}
          aria-controls={props.id}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-md p-1.5 outline-none focus-visible:ring-3"
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      }
    />
  );
}

function FieldError({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} role="alert" className="text-destructive text-xs">
      {children}
    </p>
  );
}

export function FormAlert({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          : "border-primary/40 bg-primary/10 rounded-lg border px-3 py-2 text-sm"
      }
    >
      {children}
    </p>
  );
}
