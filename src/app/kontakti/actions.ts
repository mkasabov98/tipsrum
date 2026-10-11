"use server";

import { randomUUID } from "node:crypto";

import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { validateContact } from "@/lib/contact";
import { sendEmail } from "@/lib/email";
import { CONTACT } from "@/lib/site";

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContactForm(input: {
  name: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, usually filled in by bots. */
  website?: string;
}): Promise<ContactResult> {
  // Silently accept and discard: telling a bot it failed only helps it retry.
  if (input.website) return { ok: true };

  // The same rules the form applies, re-run here because a form can be bypassed.
  const errors = validateContact(input);
  const firstError = Object.values(errors)[0];
  if (firstError) return { ok: false, error: firstError };

  await db.insert(contactSubmissions).values({
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  });

  // The submission is already stored, so a failing notification must not lose it
  // or show the visitor an error.
  try {
    await sendEmail({
      to: CONTACT.email,
      subject: `Ново запитване от ${input.name.trim()}`,
      text: [
        `Име: ${input.name.trim()}`,
        `Имейл: ${input.email.trim()}`,
        "",
        input.message.trim(),
      ].join("\n"),
    });
  } catch (error) {
    console.error("Contact notification failed to send:", error);
  }

  return { ok: true };
}
