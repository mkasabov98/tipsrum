"use client";

import { useState } from "react";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Shared form behaviour for the auth forms: values, per-field "touched" state and
 * errors recomputed from the current values on every render.
 *
 * A field's error is only surfaced once it has been blurred, so the form doesn't
 * complain while someone is still typing, but `isValid` reflects the whole form
 * immediately - that's what the submit button is bound to.
 */
export function useAuthForm<T extends Record<string, string | boolean>>(
  initial: T,
  validate: (values: T) => FieldErrors<T>,
) {
  const [values, setValues] = useState<T>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const setValue = <K extends keyof T>(name: K, value: T[K]) =>
    setValues((current) => ({ ...current, [name]: value }));

  const touch = (name: keyof T) =>
    setTouched((current) => ({ ...current, [name]: true }));

  const errorFor = (name: keyof T) =>
    touched[name] ? errors[name] : undefined;

  /** Props for a TextField. */
  const field = (name: keyof T) => ({
    value: values[name] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, event.target.value as T[keyof T]),
    onBlur: () => touch(name),
    error: errorFor(name),
  });

  /** Props for a CheckboxField; a checkbox counts as touched the moment it is toggled. */
  const checkbox = (name: keyof T) => ({
    checked: values[name] as boolean,
    onCheckedChange: (checked: boolean) => {
      setValue(name, checked as T[keyof T]);
      touch(name);
    },
    error: errorFor(name),
  });

  return { values, errors, isValid, field, checkbox, setValue, touch };
}
