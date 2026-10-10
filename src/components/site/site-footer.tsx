import Image from "next/image";
import Link from "next/link";

import {
  CONTACT,
  FOOTER_ARTICLES,
  LEGAL_NAV,
  MAIN_NAV,
  RESPONSIBLE_GAMBLING,
  SITE_NAME,
  SOCIAL,
} from "@/lib/site";

const linkClass =
  "text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline";

const SOCIAL_LINKS = [
  { href: SOCIAL.telegram, label: "Telegram" },
  { href: SOCIAL.instagram, label: "Instagram" },
  { href: SOCIAL.tiktok, label: "TikTok" },
];

// "Повече информация" repeats the main pages plus the legal ones, as on the live site.
const INFO_LINKS = [
  ...MAIN_NAV.filter((item) =>
    ["/za-nas", "/kontakti", "/planove"].includes(item.href),
  ),
  ...LEGAL_NAV,
];

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-16 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3">
          <Image
            src="/logo-light.png"
            alt={SITE_NAME}
            width={579}
            height={118}
            className="h-6 w-auto"
          />
          <a href={`mailto:${CONTACT.email}`} className={linkClass}>
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className={linkClass}>
            {CONTACT.phone}
          </a>
        </div>

        <nav aria-labelledby="footer-info" className="grid gap-3">
          <p id="footer-info" className="text-sm font-semibold">
            Повече информация
          </p>
          <ul className="grid gap-2">
            {INFO_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-articles" className="grid gap-3">
          <p id="footer-articles" className="text-sm font-semibold">
            Полезни линкове
          </p>
          <ul className="grid gap-2">
            {FOOTER_ARTICLES.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-social" className="grid gap-3">
          <p id="footer-social" className="text-sm font-semibold">
            Последвайте ни
          </p>
          <ul className="grid gap-2">
            {SOCIAL_LINKS.map((item) => (
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
        </nav>
      </div>

      <div className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto grid w-full max-w-6xl gap-3 px-4 py-6 text-xs sm:flex sm:items-center sm:justify-between">
          <p>{RESPONSIBLE_GAMBLING}</p>
          <p className="shrink-0">
            © {SITE_NAME}, България {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
