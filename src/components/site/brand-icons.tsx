import { siInstagram, siTelegram, siTiktok } from "simple-icons";

type IconProps = { className?: string };

/**
 * Brand marks from simple-icons, so the paths are the official ones rather
 * than hand-drawn approximations. Rendered as currentColor: these sit on the
 * dark footer and should match the surrounding link colour, not each brand's
 * own hue.
 */
function BrandIcon({
  path,
  title,
  className,
}: IconProps & { path: string; title: string }) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}

export const TelegramIcon = (props: IconProps) => (
  <BrandIcon path={siTelegram.path} title={siTelegram.title} {...props} />
);

export const InstagramIcon = (props: IconProps) => (
  <BrandIcon path={siInstagram.path} title={siInstagram.title} {...props} />
);

export const TikTokIcon = (props: IconProps) => (
  <BrandIcon path={siTiktok.path} title={siTiktok.title} {...props} />
);
