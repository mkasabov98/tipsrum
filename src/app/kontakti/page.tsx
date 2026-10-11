import type { Metadata } from "next";

import {
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
} from "@/components/site/brand-icons";
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
      eyebrow="Контакти"
      crumbs={[
        { href: "/", label: "Начало" },
        { href: "/kontakti", label: "Контакти" },
      ]}
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
            <ul className="flex items-center gap-2">
              {[
                {
                  href: SOCIAL.telegram,
                  label: "Telegram",
                  Icon: TelegramIcon,
                },
                {
                  href: SOCIAL.instagram,
                  label: "Instagram",
                  Icon: InstagramIcon,
                },
                { href: SOCIAL.tiktok, label: "TikTok", Icon: TikTokIcon },
              ].map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="border-border text-muted-foreground hover:text-primary hover:border-primary/40 grid size-10 place-items-center rounded-full border transition-colors"
                  >
                    <Icon className="size-4" />
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
