type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

/**
 * The single seam for outgoing email. In development messages are printed to the
 * server console; Phase 9 replaces this body with a Brevo transactional send, so
 * callers never need to change.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    // Fail loudly: silently dropping a password-reset email is worse than an error.
    throw new Error(
      "Email transport is not configured yet (Brevo is wired in Phase 9).",
    );
  }

  console.info(
    [
      "",
      "──────── email (dev: not sent) ────────",
      `To:      ${message.to}`,
      `Subject: ${message.subject}`,
      "",
      message.text,
      "───────────────────────────────────────",
      "",
    ].join("\n"),
  );
}
