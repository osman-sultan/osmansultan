import rss from "@astrojs/rss"
import type { APIContext } from "astro"

import { getPosts } from "@/lib/logbook"

// Feed at /logbook/rss.xml. Plain Markdown posts carry their full HTML;
// MDX posts are not pre-rendered by the loader, so those items have only the
// description.
export async function GET(context: APIContext) {
  const posts = await getPosts()
  return rss({
    title: "Osman Sultan's logbook",
    description: "Notes on what I'm building and learning.",
    site: context.site!,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/logbook/${post.id}`,
      content: post.rendered?.html,
    })),
    customData: "<language>en-us</language>",
  })
}
