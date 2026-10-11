import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PostCard as Post } from "@/lib/posts";
import { formatDate } from "@/lib/format";

/**
 * Article card for /polezno and the home page. The whole card is one link, so
 * the target is as big as it looks - there is no second, redundant stop for
 * keyboard users.
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-border bg-card group focus-within:ring-ring/50 overflow-hidden rounded-xl border transition-shadow focus-within:ring-3 hover:shadow-sm">
      <Link href={`/${post.slug}`} className="block outline-none">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt=""
            width={1200}
            height={675}
            className="aspect-16/9 w-full object-cover"
          />
        )}
        <div className="p-5">
          <p className="text-muted-foreground flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
            {post.category && (
              <span className="text-primary">{post.category}</span>
            )}
            {post.category && post.publishedAt && <span aria-hidden>·</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            )}
          </p>
          <h3 className="mt-3 text-lg leading-snug font-semibold">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
              {post.excerpt}
            </p>
          )}
          <p className="text-primary mt-4 flex items-center gap-1.5 text-sm font-medium">
            Прочети
            <ArrowRightIcon
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </p>
        </div>
      </Link>
    </article>
  );
}
