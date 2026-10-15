import Image from "next/image";
import Link from "next/link";

import {
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
} from "@/components/site/brand-icons";

import {
  COMPANY_NAV,
  CONTACT,
  FOOTER_ARTICLES,
  FOOTER_TAGLINE,
  PLAN_NAV,
  RESPONSIBLE_GAMBLING,
  RESPONSIBLE_GAMBLING_URL,
  SITE_NAME,
  SOCIAL,
} from "@/lib/site";

const linkClass =
  "text-muted-foreground hover:text-foreground text-sm transition-colors";

const columns = [
  { heading: "Планове", items: PLAN_NAV },
  { heading: "Компания", items: COMPANY_NAV },
  { heading: "Полезно", items: FOOTER_ARTICLES },
];

const socials = [
  { href: SOCIAL.telegram, label: "Telegram", Icon: TelegramIcon },
  { href: SOCIAL.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: SOCIAL.tiktok, label: "TikTok", Icon: TikTokIcon },
];

export function SiteFooter() {
  return (
    <footer className="dark bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid content-start gap-4">
          <Image
            src="/logo-footer.png"
            alt={SITE_NAME}
            width={1622}
            height={274}
            className="h-6 w-auto sm:h-7"
          />
          <p className="text-muted-foreground max-w-56 text-sm">
            {FOOTER_TAGLINE}
          </p>
          <a
            href={RESPONSIBLE_GAMBLING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-card/60 hover:border-loss/50 flex max-w-64 items-start gap-3 rounded-lg border p-3 transition-colors"
          >
            <span
              aria-hidden
              className="text-loss border-loss/50 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold"
            >
              18
            </span>
            <span className="text-muted-foreground text-[11px] leading-snug">
              {RESPONSIBLE_GAMBLING}
              <span className="sr-only"> (помощ при хазартна зависимост)</span>
            </span>
          </a>
        </div>

        {columns.map((column) => (
          <nav key={column.heading} className="grid content-start gap-3">
            <p className="text-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
              <span aria-hidden className="bg-brand-soft h-px w-4" />
              {column.heading}
            </p>
            <ul className="grid gap-2">
              {column.items.map((item) => (
                <li key={`${column.heading}-${item.href}`}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-border border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-start gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground font-mono text-xs">
            © {SITE_NAME}, България {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>
              {CONTACT.email}
            </a>
            <ul className="flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="text-muted-foreground hover:text-foreground hover:border-foreground/30 border-border grid size-9 place-items-center rounded-full border transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
