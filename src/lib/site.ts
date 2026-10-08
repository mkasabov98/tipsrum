/**
 * Single source of truth for navigation, contact details and social links,
 * so the header, the footer and the contact page can never disagree.
 * Values taken from the live WordPress site.
 */

export const SITE_NAME = "Tipsrum";

export const CONTACT = {
  email: "info@tipsrum.com",
  phone: "+359 88 977 6544",
  // Digits only, for the tel: link.
  phoneHref: "tel:+359889776544",
} as const;

export const SOCIAL = {
  telegram: "https://t.me/tipsrum_support",
  instagram: "https://www.instagram.com/tipsrum/",
  tiktok: "https://www.tiktok.com/@tipsrum1",
} as const;

export type NavItem = {
  href: string;
  label: string;
  children?: readonly NavItem[];
};

export const MAIN_NAV: readonly NavItem[] = [
  { href: "/", label: "Начало" },
  {
    href: "/planove",
    label: "Планове",
    children: [
      { href: "/free", label: "Безплатен" },
      { href: "/premium", label: "Премиум" },
    ],
  },
  { href: "/polezno", label: "Полезно" },
  { href: "/za-nas", label: "За нас" },
  { href: "/kontakti", label: "Контакти" },
];

export const LEGAL_NAV: readonly NavItem[] = [
  { href: "/obshti-usloviya", label: "Общи условия" },
  { href: "/gdpr", label: "GDPR" },
  { href: "/politika-za-biskvitkite", label: "Бисквитки" },
];

/**
 * Articles promoted in the footer. These keep their original WordPress slugs so
 * existing links and search rankings survive the cutover.
 */
export const FOOTER_ARTICLES: readonly NavItem[] = [
  { href: "/suveti-pri-zapochvane", label: "Съвети при започване" },
  {
    href: "/kak-da-izbegnete-limitirane",
    label: "Как да избегнете лимитиране",
  },
  { href: "/opredelqne-na-banka", label: "Определяне на банка" },
];

// Required on a gambling-adjacent site; shown in the footer of every page.
export const RESPONSIBLE_GAMBLING =
  "Хазартът води до пристрастяване! Трябва да бъдете над 18 години, за да използвате нашия сайт. Бъдете разумни.";
