import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-shell";
import { listPosts } from "@/lib/posts";

const TITLE = "Полезно";

export const metadata: Metadata = {
  title: `${TITLE} | Tipsrum`,
  description:
    "Статии за стратегия, управление на банка и лимитиране на акаунти — всичко, което помага преди първия залог.",
};

export default async function BlogIndexPage() {
  const posts = await listPosts();

  return (
    <main className="flex-1">
      <PageHero
        width="wide"
        eyebrow={TITLE}
        title="Четива, които правят разликата"
        lead="Стратегия, управление на банка и как да не се окажеш лимитиран. Кратки статии от екипа, писани от опит с реални залози."
        crumbs={[
          { href: "/", label: "Начало" },
          { href: "/polezno", label: TITLE },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Все още няма публикувани статии.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <CtaBand
        title="Готов да приложиш прочетеното?"
        lead="Влез в безплатната група и следи как изглеждат анализираните прогнози в реално време."
        primary={{ href: "/register", label: "Влез безплатно" }}
        secondary={{ href: "/planove", label: "Разгледай плановете" }}
      />
    </main>
  );
}
