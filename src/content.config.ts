import { file, glob } from "astro/loaders"
import { z } from "astro/zod"
import { defineCollection } from "astro:content"

// Projects live in one JSON file; each entry needs a unique `id`. Images are
// paths relative to that file and are validated and optimised by Astro.
const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      // One or more tags; the first is the primary one.
      types: z.array(z.enum(["ml/ai", "web", "algorithms", "ui/ux"])).min(1),
      description: z.string(),
      date: z.string(),
      group: z.enum(["recent", "earlier"]),
      image: image(),
      link: z.url(),
    }),
})

// Logbook posts: one Markdown (or MDX, for posts that embed components)
// file each in src/content/logbook. The file name
// is the URL (`hello.md` -> /logbook/hello); a `slug` in the frontmatter
// overrides it. Read time is computed from the body, see src/lib/logbook.ts.
const logbook = defineCollection({
  loader: glob({ base: "./src/content/logbook", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Date written, as YYYY-MM-DD.
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Drafts are left out of the built site (they still show in `astro dev`).
    draft: z.boolean().default(false),
  }),
})

export const collections = { projects, logbook }
