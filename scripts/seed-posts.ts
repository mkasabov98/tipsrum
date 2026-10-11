/**
 * Seeds the `posts` table with the six articles ported from the WordPress site.
 *
 * The body of each article lives in src/content/<slug>.html - the same sanitised
 * fragments the legal pages use. Only the metadata lives here: titles, excerpts
 * and publish dates come from the live site (the WP REST API for the dates), the
 * category labels are ours, since every live post sits in "uncategorized".
 *
 * Safe to re-run: slug is the natural key and an existing row is updated in
 * place, so re-seeding picks up edits to the HTML without creating duplicates.
 *
 *   pnpm db:seed:posts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { config } from "dotenv";

config({ path: ".env.local" });

type Seed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  /** Filename in src/content, when it differs from the slug. */
  file?: string;
};

/**
 * Slugs are the live site's, so inbound links and rankings survive the cutover.
 * The one exception is `polezni-stapki`: WordPress had generated a truncated
 * percent-encoded Cyrillic slug, which next.config.ts redirects here.
 */
const POSTS: readonly Seed[] = [
  {
    slug: "suveti-pri-zapochvane",
    title: "Съвети при започване",
    excerpt:
      "Влезте в света на конните залагания с ясна стратегия. Инвестирайте само средства, които можете да задържите дългосрочно, следвайте препоръчаните залози и избягвайте емоционални решения.",
    category: "Стратегия",
    publishedAt: "2025-01-18T10:06:41Z",
  },
  {
    slug: "opredelqne-na-banka",
    title: "Определяне на банка",
    excerpt:
      "Успехът в конните залагания не е случайност. Бъдете дисциплинирани, третирайте залаганията като инвестиция и избягвайте импулсивни решения. Така печалбите ще станат част от вашата стратегия.",
    category: "Банкрол",
    publishedAt: "2025-01-17T13:24:02Z",
  },
  {
    slug: "kak-da-izbegnete-limitirane",
    title: "Как да избегнете лимитиране",
    excerpt:
      "Лимитирането от букмейкъри не е краят на играта. Чести печалби и стойностни залози ви правят мишена, но с умна стратегия можете да останете в играта.",
    category: "Букмейкъри",
    publishedAt: "2025-01-16T13:24:25Z",
  },
  {
    slug: "polezni-stapki",
    title: "Полезни стъпки при лимитиране на акаунт",
    excerpt:
      "Лимитираха ви акаунта? Не се отказвайте — с правилните стратегии можете да продължите да залагате и да намалите риска от повторно ограничаване.",
    category: "Букмейкъри",
    publishedAt: "2025-01-15T13:31:58Z",
  },
  {
    slug: "chestigreshki",
    title: "Топ грешки, които хората допускат, когато залагат на коне",
    excerpt:
      "Честите грешки при залаганията включват пренебрегване на миналото представяне на коня, емоционални решения, игнориране на условията на пистата и неправилно управление на банката.",
    category: "Грешки",
    publishedAt: "2024-09-24T10:06:28Z",
  },
  {
    slug: "riskove_ot_hazart",
    title: "Тъмната страна на хазарта: какво трябва да знаем",
    excerpt:
      "Хазартът може бързо да се превърне в опасна зависимост, която разрушава финансовата стабилност, води до дългове и тежко засяга психичното здраве на играча.",
    category: "Отговорна игра",
    publishedAt: "2024-08-24T00:00:44Z",
  },
];

async function main() {
  const { db } = await import("../src/db");
  const { posts } = await import("../src/db/schema");

  for (const post of POSTS) {
    const file = post.file ?? post.slug;
    const content = readFileSync(
      join(process.cwd(), "src", "content", `${file}.html`),
      "utf8",
    );

    const values = {
      id: post.slug,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      content,
      coverImage: `/articles/${post.slug}.webp`,
      publishedAt: new Date(post.publishedAt),
      updatedAt: new Date(),
    };

    await db
      .insert(posts)
      .values(values)
      .onConflictDoUpdate({ target: posts.slug, set: values });

    console.info(`seeded ${post.slug} (${content.length} bytes)`);
  }

  console.info(`done: ${POSTS.length} posts`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
