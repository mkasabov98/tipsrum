export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

// WordPress's strict username character set, minus spaces and "@" (which make a
// username easy to confuse with an email address).
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export function isValidUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}
