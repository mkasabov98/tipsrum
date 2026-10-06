import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
};

export function TextField({
  id,
  label,
  hint,
  error,
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
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
