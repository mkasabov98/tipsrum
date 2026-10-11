import { ClockIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { PostCard } from "@/components/blog/post-card";
import { CtaBand } from "@/components/site/cta-band";
import { Eyebrow } from "@/components/site/page-shell";
import { Prose } from "@/components/site/prose";
import { formatDate } from "@/lib/format";
import { getPost, readingMinutes, relatedPosts } from "@/lib/posts";

/**
 * Articles live at the site root, keeping the slugs WordPress gave them so
 * inbound links and rankings survive the cutover. Static routes win over this
 * dynamic one in Next, so /planove and friends are unaffected; anything that is
 * not a published post falls through to the 404 page.
 */

type Params = { params: Promise<{ slug: string }> };

/**
 * Old WordPress URLs that must keep working. The Cyrillic one was truncated by
 * WordPress mid-word and arrives percent-encoded; it is handled here rather
 * than in next.config.ts, because redirect sources are matched against the
 * still-encoded pathname while this param is already decoded.
 */
const LEGACY_SLUGS: Record<string, string> = {
  "полезни-стъпки-при-лимитиране-на-акау": "polezni-stapki",
};

/** Matches the slug as given and percent-decoded, since which one arrives
 *  depends on how the client encoded the request. */
function legacyTarget(slug: string): string | undefined {
  if (LEGACY_SLUGS[slug]) return LEGACY_SLUGS[slug];
  try {
    return LEGACY_SLUGS[decodeURIComponent(slug)];
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Tipsrum`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    const moved = legacyTarget(slug);
    if (moved) permanentRedirect(`/${moved}`);
    notFound();
  }

  const related = await relatedPosts(slug);
  const minutes = readingMinutes(post.content);

  return (
    <main className="flex-1">
      <div className="dark bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
          <nav aria-label="Път до страницата" className="mb-5">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Начало
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/polezno" className="hover:text-foreground">
                  Полезно
                </Link>
              </li>
            </ol>
          </nav>

          {post.category && <Eyebrow>{post.category}</Eyebrow>}

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <p className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            <span className="flex items-center gap-1.5">
              <ClockIcon aria-hidden className="size-3.5" />
              {minutes} мин четене
            </span>
          </p>
        </div>
      </div>

      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt=""
            width={1200}
            height={675}
            priority
            className="border-border mb-10 aspect-16/9 w-full rounded-xl border object-cover"
          />
        )}

        {post.excerpt && (
          <p className="border-primary/40 text-muted-foreground mb-8 border-l-2 pl-5 text-base leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <Prose html={post.content} />
      </article>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:pb-20">
          <Eyebrow>Още по темата</Eyebrow>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Продължи с тези статии
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      )}

      <CtaBand
        title="Приложи го на практика"
        lead="Безплатната група е най-лесният начин да видиш как изглеждат анализираните прогнози ден след ден."
        primary={{ href: "/register", label: "Влез безплатно" }}
        secondary={{ href: "/polezno", label: "Всички статии" }}
      />
    </main>
  );
}
