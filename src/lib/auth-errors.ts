const MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: "Вече има профил с този имейл.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Вече има профил с този имейл.",
  USERNAME_TAKEN: "Това потребителско име е заето.",
  INVALID_USERNAME:
    "Потребителското име трябва да е между 3 и 30 символа: латински букви, цифри, точка, долна черта или тире.",
  USERNAME_CHANGE_NOT_ALLOWED: "Потребителското име не може да се променя.",
  TERMS_NOT_ACCEPTED:
    "За да продължиш, приеми Общите условия и Политиката за поверителност.",
  INVALID_EMAIL_OR_PASSWORD: "Грешен имейл или парола.",
  INVALID_EMAIL: "Невалиден имейл адрес.",
  PASSWORD_TOO_SHORT: "Паролата трябва да е поне 8 символа.",
  PASSWORD_TOO_LONG: "Паролата е твърде дълга.",
  INVALID_TOKEN: "Линкът за нова парола е невалиден или е изтекъл.",
};

const FALLBACK = "Нещо се обърка. Опитай отново.";
const RATE_LIMITED = "Твърде много опити. Изчакай малко и опитай отново.";

type AuthClientError = { code?: string; status?: number } | null | undefined;

/** Maps a Better-Auth client error to Bulgarian copy for the forms. */
export function authErrorMessage(error: AuthClientError): string {
  if (!error) return FALLBACK;
  if (error.status === 429) return RATE_LIMITED;
  return (error.code && MESSAGES[error.code]) || FALLBACK;
}
