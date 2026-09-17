export const DEFAULT_AFTER_LOGIN = "/my_account";

// The WordPress site generated absolute ?arm_redirect=https://tipsrum.com/... links.
const LEGACY_HOSTS = new Set(["tipsrum.com", "www.tipsrum.com"]);

// Sending someone back to an auth page after logging in would be a dead end.
const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot_password",
  "/reset_password",
];

const PLACEHOLDER_ORIGIN = "http://placeholder.invalid";

/**
 * Turns an untrusted return-to value into a same-site path. Anything that resolves to
 * another origin falls back to the default, so the login page can't be abused as an
 * open redirect (e.g. ?redirect=//evil.example).
 */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_AFTER_LOGIN;

  let url: URL;
  try {
    url = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return DEFAULT_AFTER_LOGIN;
  }

  const isRelative = url.origin === PLACEHOLDER_ORIGIN;
  const isLegacySite =
    url.protocol === "https:" && LEGACY_HOSTS.has(url.hostname);
  if (!isRelative && !isLegacySite) return DEFAULT_AFTER_LOGIN;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (AUTH_PAGES.includes(path)) return DEFAULT_AFTER_LOGIN;

  return `${path}${url.search}${url.hash}`;
}

type SearchParams = Record<string, string | string[] | undefined>;

/** Reads `?redirect=`, falling back to the legacy WordPress `?arm_redirect=`. */
export function redirectTargetFromSearchParams(params: SearchParams): string {
  const pick = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  return safeRedirectPath(pick("redirect") ?? pick("arm_redirect"));
}
