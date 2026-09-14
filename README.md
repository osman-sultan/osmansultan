# osmansultan.xyz

my personal site, built with astro and deployed to aws via [sst.dev](https://sst.dev).

the home page has a prince of persia themed title with a sand shader (three.js) and a small rooftop runner drawn on a canvas. you can rewind time in it.

## stack

- astro 7 with react islands, tailwind 4, shadcn/ui
- bun for installs and scripts
- sst: s3 and cloudfront for the static site, route 53 for the domain, a cloudfront response headers policy, and an aws budgets alert, all in `sst.config.ts`
- sst console autodeploy: a push to `main` deploys production, pull requests get a `pr-<n>` preview stage
- github actions: lint and typecheck, lighthouse on every push and pr, and a latex build of the resume
- posthog for analytics and web vitals

## running it

```sh
bun install
bun run dev        # local server
bun run build      # static output in dist/
bun run typecheck
bun run lint
```

on windows, build from a path with a capital `D` in `Documents`, or the css is dropped from the output.

## deploying

pushing to `main` is the deploy. to deploy by hand:

```sh
aws sso login --sso-session osman-personal
bunx sst deploy --stage production
```

## layout

```
src/pages/          one file per page
src/components/     the title, the runner, the resume viewer, shadcn/ui
src/lib/sands.ts    the title's sand shader
src/lib/runner.ts   the runner game
src/data/           projects.json (content collection)
src/content/logbook/ one markdown file per logbook post
src/assets/         fonts, project images, game art
resume/resume.tex   resume source; ci builds public/resume.pdf from it
scripts/            game art slicer, portrait frame builder, headless game check
```

## writing a logbook post

add a markdown file to `src/content/logbook/`; its file name is the url. use the `.mdx` extension when a post imports components from the site; in `.mdx` posts, code fences render through the rare-ui code block (copy button, line numbers), and in `.md` posts through shiki. the frontmatter needs `title`, `description` and `date` (yyyy-mm-dd), and can have `updated`, `tags` and `draft: true`. read time is computed from the body. push to `main` and it is live; the feed is at `/logbook/rss.xml`.

## checking the game

`node scripts/check-runner.mjs http://localhost:4321/ <outdir>` drives a headless chrome through a tap, a jump and a rewind at phone and desktop sizes and saves screenshots. chrome's `--screenshot` flag is not reliable for the game because its idle-callback boot may not run under a virtual clock.

## license

the code is under the gnu affero general public license v3.0, see `LICENSE`. the writing, the resume, the project screenshots, the game art and the fonts are mine or third-party and are not covered by it.
