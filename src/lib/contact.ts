/**
 * Contact-form rules, shared by the form and the server action. Kept out of the
 * "use server" module because such a file may only export async functions.
 */
export const MESSAGE_MAX_LENGTH = 180;
export const NAME_MAX_LENGTH = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Въведи име.";
  else if (name.length > NAME_MAX_LENGTH) errors.name = "Името е твърде дълго.";

  const email = values.email.trim();
  if (!email) errors.email = "Въведи имейл.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Невалиден имейл адрес.";

  const message = values.message.trim();
  if (!message) errors.message = "Напиши съобщение.";
  else if (values.message.length > MESSAGE_MAX_LENGTH)
    errors.message = `Съобщението трябва да е до ${MESSAGE_MAX_LENGTH} символа.`;

  return errors;
}
