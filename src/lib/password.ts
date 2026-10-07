export const PASSWORD_MIN_LENGTH = 8;
// Better-Auth's own default ceiling; stated here so the client agrees with it.
export const PASSWORD_MAX_LENGTH = 128;

// Unicode-aware on purpose: a Bulgarian user typing Cyrillic should still
// satisfy "upper case" and "lower case" rather than be told the password is weak.
const HAS_LOWER = /\p{Ll}/u;
const HAS_UPPER = /\p{Lu}/u;
const HAS_DIGIT = /\p{Nd}/u;
const HAS_SYMBOL = /[^\p{L}\p{Nd}]/u;

export type PasswordProblem =
  "PASSWORD_TOO_SHORT" | "PASSWORD_TOO_LONG" | "PASSWORD_TOO_WEAK";

/**
 * The single source of truth for password rules, shared by the forms and the
 * server hook, so the two can never drift apart.
 */
export function passwordProblem(password: string): PasswordProblem | null {
  if (password.length < PASSWORD_MIN_LENGTH) return "PASSWORD_TOO_SHORT";
  if (password.length > PASSWORD_MAX_LENGTH) return "PASSWORD_TOO_LONG";
  if (
    !HAS_LOWER.test(password) ||
    !HAS_UPPER.test(password) ||
    !HAS_DIGIT.test(password) ||
    !HAS_SYMBOL.test(password)
  ) {
    return "PASSWORD_TOO_WEAK";
  }
  return null;
}
