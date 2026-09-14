# osmansultan.xyz

Personal site of Osman Sultan. Astro, deployed to AWS via [sst.dev](https://sst.dev).

The home page has a Prince of Persia themed title with a sand shader (Three.js) and a small rooftop runner drawn on a canvas. You can rewind time in it.

## Stack

- Astro 7 with React islands, Tailwind 4, shadcn/ui
- Bun for installs and scripts
- SST: S3 and CloudFront for the static site, Route 53 for the domain, a CloudFront response headers policy, and an AWS Budgets alert, all in `sst.config.ts`
- SST Console Autodeploy: a push to `main` deploys production, pull requests get a `pr-<n>` preview stage
- GitHub Actions: lint and typecheck, Lighthouse on every push and PR, and a LaTeX build of the resume
- PostHog for analytics and web vitals

## Running it

```sh
bun install
bun run dev        # local server
bun run build      # static output in dist/
bun run typecheck
bun run lint
```

On Windows, build from a path with a capital `D` in `Documents`, or the CSS is dropped from the output.

## Deploying

Pushing to `main` is the deploy. To deploy by hand:

```sh
aws sso login --sso-session osman-personal
bunx sst deploy --stage production
```

## Layout

```
src/pages/          one file per page
src/components/     the title, the runner, the resume viewer, shadcn/ui
src/lib/sands.ts    the title's sand shader
src/lib/runner.ts   the runner game
src/data/           projects.json (content collection)
src/assets/         fonts, project images, game art
resume/resume.tex   resume source; CI builds public/resume.pdf from it
scripts/            game art slicer, portrait frame builder, headless game check
```

## Checking the game

`node scripts/check-runner.mjs http://localhost:4321/ <outdir>` drives a headless Chrome through a tap, a jump and a rewind at phone and desktop sizes and saves screenshots. Chrome's `--screenshot` flag is not reliable for the game because its idle-callback boot may not run under a virtual clock.
