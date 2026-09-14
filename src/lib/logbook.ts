import { getCollection, type CollectionEntry } from "astro:content"
import readingTime from "reading-time"

export type Post = CollectionEntry<"logbook">

export const AUTHOR = { name: "Osman Sultan", href: "/about" }

/** Published posts, newest first. Drafts only appear in `astro dev`. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection(
    "logbook",
    ({ data }) => import.meta.env.DEV || !data.draft
  )
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** "4 min read", from the Markdown body at 200 words a minute. */
export function readTime(post: Post): string {
  return readingTime(post.body ?? "").text
}

/** "Sep 13, 2026". Dates are parsed as UTC midnight, so format in UTC too. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/** YYYY-MM-DD for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
