import { and, desc, isNotNull, lte, ne, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { posts } from "@/db/schema";

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
};

const CARD_COLUMNS = {
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  category: posts.category,
  coverImage: posts.coverImage,
  publishedAt: posts.publishedAt,
};

/** A post counts as published once it has a date and that date has passed. */
const published = () =>
  and(isNotNull(posts.publishedAt), lte(posts.publishedAt, sql`now()`));

export const listPosts = cache(async (limit?: number): Promise<PostCard[]> => {
  const query = db
    .select(CARD_COLUMNS)
    .from(posts)
    .where(published())
    .orderBy(desc(posts.publishedAt));

  return limit ? query.limit(limit) : query;
});

export const getPost = cache(async (slug: string) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(published(), sql`${posts.slug} = ${slug}`))
    .limit(1);

  return post ?? null;
});

/** Newest other articles, for the "read next" row under an article. */
export const relatedPosts = cache(
  async (slug: string, limit = 3): Promise<PostCard[]> =>
    db
      .select(CARD_COLUMNS)
      .from(posts)
      .where(and(published(), ne(posts.slug, slug)))
      .orderBy(desc(posts.publishedAt))
      .limit(limit),
);

/**
 * Reading time from the article body. 180 words per minute is the usual figure
 * for non-fiction; the floor keeps the shortest article from reading "1 мин".
 */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}
