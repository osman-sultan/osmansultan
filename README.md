# osmansultan.xyz

my personal site, built with astro and deployed to aws via [sst.dev](https://sst.dev).

the home page has a prince of persia themed title with a sand shader (three.js) and a small rooftop runner drawn on a canvas. you can rewind time in it.

## stack

- astro 7 with react islands, tailwind 4, shadcn/ui
- bun for installs and scripts
- a small api for the resume in `backend/`: fastapi and pydantic on lambda (python 3.14, uv), at `api.osmansultan.xyz`
- sst: s3 and cloudfront for the static site, lambda, a versioned s3 bucket and a second cloudfront distribution for the api, route 53 for the domain, a cloudfront response headers policy, and an aws budgets alert, all in `sst.config.ts`
- sst console autodeploy: a push to `main` deploys production, pull requests get a `pr-<n>` preview stage. a push that only touches the site deploys only the site, and one that only touches `backend/` deploys only the api
- github actions: lint and typecheck for the site, ruff, ty and pytest for the api, lighthouse on every push and pr
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

## the resume and /admin

the resume is not a file in this repo. it lives in a versioned s3 bucket behind the api, and the site reads it from `api.osmansultan.xyz/resume.pdf`.

to change it, go to `/admin` (not linked anywhere; typing `4PR28U` on any page jumps there), sign in with github, and drop in a pdf. it is live straight away. every upload is kept: the page lists each version with its date and note, and any of them can be viewed or restored. only one github account is let in, set by `ADMIN_GITHUB_ID` in `sst.config.ts`.

sign-in needs a github oauth app per stage (settings > developer settings > oauth apps), with the callback `<api url>/auth/github/callback`:

```sh
bunx sst secret set GithubClientId <client id> --stage production
bunx sst secret set GithubClientSecret <client secret> --stage production
```

## running the api

```sh
cd backend
uv sync
uv run pytest            # mocked s3 and a faked github, no credentials needed
uv run ruff check . && uv run ruff format --check . && uv run ty check
```

to run it next to `bun run dev` without touching aws, start a local s3 stand-in and point the api at it:

```sh
uv run moto_server -p 5001 &
export AWS_ENDPOINT_URL_S3=http://localhost:5001 AWS_ACCESS_KEY_ID=x AWS_SECRET_ACCESS_KEY=x AWS_DEFAULT_REGION=us-east-1
uv run python -c "import boto3; s3 = boto3.client('s3'); s3.create_bucket(Bucket='resume-local'); s3.put_bucket_versioning(Bucket='resume-local', VersioningConfiguration={'Status': 'Enabled'})"
uv run uvicorn resume_api.main:app --port 8000
```

with these in `backend/.env` (the client id and secret come from an oauth app whose callback is `http://localhost:8000/auth/github/callback`):

```sh
RESUME_BUCKET=resume-local
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_USER_ID=91383999
SESSION_SECRET=<32 or more random characters>
API_URL=http://localhost:8000
SITE_URL=http://localhost:4321
COOKIE_SECURE=false
DOCS=true
```

## deploying

pushing to `main` is the deploy. to deploy by hand:

```sh
aws sso login --sso-session osman-personal
bunx sst deploy --stage production
```

## layout

```
src/pages/          one file per page
src/components/     the title, the runner, the resume viewer, the admin page, shadcn/ui
src/lib/sands.ts    the title's sand shader
src/lib/runner.ts   the runner game
src/data/           projects.json (content collection)
src/content/logbook/ one markdown file per logbook post
src/assets/         fonts, project images, game art
backend/            the resume api: fastapi app, tests, and the pdf the bucket is seeded with
resume/resume.tex   latex source of an older resume
scripts/            game art slicer, portrait frame builder, headless game check
```

## writing a logbook post

add a markdown file to `src/content/logbook/`; its file name is the url. use the `.mdx` extension when a post imports components from the site; in `.mdx` posts, code fences render through the rare-ui code block (copy button, line numbers), and in `.md` posts through shiki. the frontmatter needs `title`, `description` and `date` (yyyy-mm-dd), and can have `updated`, `tags` and `draft: true`. read time is computed from the body. push to `main` and it is live; the feed is at `/logbook/rss.xml`.

## checking the game

`node scripts/check-runner.mjs http://localhost:4321/ <outdir>` drives a headless chrome through a tap, a jump and a rewind at phone and desktop sizes and saves screenshots. chrome's `--screenshot` flag is not reliable for the game because its idle-callback boot may not run under a virtual clock.

## license

the code is under the gnu affero general public license v3.0, see `LICENSE`. the writing, the resume, the project screenshots, the game art and the fonts are mine or third-party and are not covered by it.
