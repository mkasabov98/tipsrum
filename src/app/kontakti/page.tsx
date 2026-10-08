import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { PageShell } from "@/components/site/page-shell";
import { CONTACT, SOCIAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакти | Tipsrum",
  description:
    "Свържете се с екипа на Tipsrum по имейл, телефон или в социалните мрежи.",
};

const linkClass = "text-primary underline-offset-4 hover:underline break-words";

export default function ContactPage() {
  return (
    <PageShell
      title="Свържете се с нас"
      lead="Имате въпроси или искате повече информация за нашите прогнози? Пишете ни по предпочитания от вас канал."
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="grid content-start gap-6">
          <div className="grid gap-2">
            <h2 className="text-sm font-semibold">Имейл</h2>
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>
              {CONTACT.email}
            </a>
          </div>
          <div className="grid gap-2">
            <h2 className="text-sm font-semibold">Телефон</h2>
            <a href={CONTACT.phoneHref} className={linkClass}>
              {CONTACT.phone}
            </a>
          </div>
          <div className="grid gap-2">
            <h2 className="text-sm font-semibold">Социални мрежи</h2>
            <p className="text-muted-foreground text-sm">
              В Telegram качваме залозите, а в социалните мрежи споделяме
              полезно съдържание.
            </p>
            <ul className="grid gap-1">
              {[
                { href: SOCIAL.telegram, label: "Telegram" },
                { href: SOCIAL.instagram, label: "Instagram" },
                { href: SOCIAL.tiktok, label: "TikTok" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <h2 className="text-sm font-semibold">Форма за контакт</h2>
          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
