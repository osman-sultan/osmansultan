/// <reference path="./.sst/platform/config.d.ts" />

// Personal AWS account only. The profile below must never point at a work
// account; `sst deploy --stage production` uses it directly. AWS_PROFILE in the
// environment overrides this value, so keep that variable unset.
// SST Console Autodeploy sets SST_AWS_NO_PROFILE, which makes SST ignore this
// value and use the build role instead, so it is safe to set unconditionally.
const AWS_PROFILE = "osman-personal"
// Where AWS Budgets sends the monthly spend alerts.
const BUDGET_EMAIL = "osmansultan2002@gmail.com"

const DOMAIN = "osmansultan.xyz"
// The resume API (backend/) gets its own subdomain and its own CloudFront
// distribution, so the site and the API deploy and fail independently.
const API_DOMAIN = `api.${DOMAIN}`
// The one GitHub account allowed into /admin: github.com/osman-sultan. The
// numeric id, because a login can be renamed and then taken by someone else.
const ADMIN_GITHUB_ID = "91383999"

// What each half of the app is built from. A push that only touches one
// half deploys only that half (see console.autodeploy.workflow).
const SITE_PATHS = [
  "src/",
  "public/",
  "astro.config.mjs",
  "package.json",
  "bun.lock",
  "tsconfig.json",
  "components.json",
]
const API_PATHS = ["backend/"]
// Changes here are not part of what gets deployed.
const NO_DEPLOY_PATHS = [
  "README.md",
  "LICENSE",
  ".github/",
  ".gitignore",
  "scripts/",
  "resume/",
  "lighthouserc.json",
]
// Site first: Api is the component that also waits for the site's URL.
const TARGETS = { site: "Site", api: "Api" }

export default $config({
  app(input) {
    return {
      name: "osmansultan",
      // Production resources survive `sst remove`; preview stages are cleaned up.
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: AWS_PROFILE,
          region: "us-east-1",
        },
        // Generates the API's session secret (see run()).
        random: { package: "@pulumi/random", version: "4.21.6" },
      },
    }
  },
  console: {
    autodeploy: {
      // SST Console runs these on AWS CodeBuild in the personal account.
      // Pushes to main deploy production; pull requests get a pr-<n> preview
      // stage that is removed when the PR closes.
      target(event) {
        if (
          event.type === "branch" &&
          event.branch === "main" &&
          event.action === "pushed"
        ) {
          return { stage: "production" }
        }
        // Preview stages for pull requests people open (needs a PR
        // environment in the console's Autodeploy settings). Dependabot's
        // bumps are checked by CI and Lighthouse; a preview would only add
        // a CloudFront distribution per PR for nothing.
        if (
          event.type === "pull_request" &&
          event.sender.username !== "dependabot[bot]"
        ) {
          return { stage: `pr-${event.number}` }
        }
      },
      // The default runner installs with npm, but this repo only has bun.lock,
      // and the API is packaged with uv. SST_STAGE is already set in the build.
      //
      // A push to main deploys only the half of the app it touched: the site,
      // the API, or both. "Touched" is measured against the commit of the last
      // successful deploy, kept in an SSM parameter, so a push of several
      // commits or a deploy that failed half way cannot leave one half behind.
      // Whenever that cannot be worked out (first deploy, a change to this
      // file or to anything not listed above, no git history), everything is
      // deployed, which is always correct: SST only updates what differs.
      async workflow({ $, event }) {
        await $`npm i -g bun`
        await $`curl -LsSf https://astral.sh/uv/install.sh | sh`
        process.env.PATH = `${process.env.HOME}/.local/bin:${process.env.PATH}`
        await $`bun install --frozen-lockfile`
        const marker = `/sst/osmansultan/${process.env.SST_STAGE}/deployed-commit`
        // Output of a command, or "" if it fails. Nothing here may fail the
        // build: the worst case is a full deploy.
        const read = async (run: { text(): Promise<string> }) => {
          try {
            return (await run.text()).trim()
          } catch {
            return ""
          }
        }
        if (event.action === "removed") {
          await $`bun sst remove`
          await read($`aws ssm delete-parameter --name ${marker}`.quiet())
          return
        }

        const head = await read($`git rev-parse HEAD`.quiet())
        const deployed = await read(
          $`aws ssm get-parameter --name ${marker} --query Parameter.Value --output text`.quiet()
        )

        let targets: string[] | undefined
        if (head && deployed) {
          // The runner's checkout may be shallow; make sure both ends exist.
          await read($`git fetch --quiet origin ${deployed}`.quiet())
          const diff = await read(
            $`git diff --name-only ${deployed} ${head}`.quiet()
          )
          const changed = diff ? diff.split("\n") : []
          const within = (paths: string[]) => (file: string) =>
            paths.some((path) => file === path || file.startsWith(path))
          const site = changed.some(within(SITE_PATHS))
          const api = changed.some(within(API_PATHS))
          const other = changed.some(
            (file) =>
              !within([...SITE_PATHS, ...API_PATHS, ...NO_DEPLOY_PATHS])(file)
          )
          const known = head === deployed || changed.length > 0
          if (known && !other) {
            targets = [
              ...(site ? [TARGETS.site] : []),
              ...(api ? [TARGETS.api] : []),
            ]
          }
        }

        if (targets === undefined) {
          await $`bun sst deploy`
        } else {
          for (const target of targets) {
            await $`bun sst deploy --target ${target}`
          }
        }
        if (head) {
          await read(
            $`aws ssm put-parameter --name ${marker} --value ${head} --type String --overwrite`.quiet()
          )
        }
      },
    },
  },
  async run() {
    const isProd = $app.stage === "production"

    // Owning the infrastructure means owning the surprises: email at 80% of
    // a $5/month actual spend and when the forecast crosses 100%. Budgets are
    // account-wide, so only the production stage creates one.
    if (isProd) {
      new aws.budgets.Budget("MonthlyBudget", {
        budgetType: "COST",
        limitAmount: "5",
        limitUnit: "USD",
        timeUnit: "MONTHLY",
        notifications: [
          {
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
            notificationType: "ACTUAL",
            subscriberEmailAddresses: [BUDGET_EMAIL],
          },
          {
            comparisonOperator: "GREATER_THAN",
            threshold: 100,
            thresholdType: "PERCENTAGE",
            notificationType: "FORECASTED",
            subscriberEmailAddresses: [BUDGET_EMAIL],
          },
        ],
      })
    }

    // Google Search Console domain verification (TXT on the apex). The
    // hosted zone was created by Route 53 when the domain was registered.
    if (isProd) {
      const zone = aws.route53.getZoneOutput({ name: "osmansultan.xyz" })
      new aws.route53.Record("GoogleSiteVerification", {
        zoneId: zone.zoneId,
        name: "osmansultan.xyz",
        type: "TXT",
        ttl: 300,
        records: [
          "google-site-verification=1GHRR_g9JUItu7HRNY5rumE7U_CdIXKXcrBwnQxRvXA",
        ],
      })
    }

    // ---- Resume API (backend/) ------------------------------------------
    // FastAPI on Lambda behind its own CloudFront distribution. /admin on the
    // site uploads the resume here; the API keeps it, and every version of
    // it, in a versioned bucket.
    const apiRouter = new sst.aws.Router("ApiRouter", {
      domain: isProd ? API_DOMAIN : undefined,
      edge: {
        viewerResponse: {
          // The resume is public and the site fetches it from another origin
          // (PDF.js), so it has to be readable cross-origin.
          injection: `if (event.request.uri === "/resume.pdf") event.response.headers["access-control-allow-origin"] = { value: "*" };`,
        },
      },
    })
    const apiUrl = apiRouter.url

    // One object, resume.pdf. Versioning is the history: each upload or
    // restore adds a version and the old ones stay. CloudFront may read the
    // current version (that is the public resume); only the API's role can
    // list or read old ones.
    const resumeBucket = new sst.aws.Bucket("Resume", {
      versioning: true,
      access: "cloudfront",
    })
    // The resume that was in the repo, as version 1, so /resume works from
    // the first deploy and in preview stages. Written once: later versions
    // come from /admin, and ignoreChanges keeps a deploy from ever putting
    // this file back on top of them.
    const { createHash } = await import("node:crypto")
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    // Absolute: Pulumi resolves asset paths from its own working directory.
    const seed = join($cli.paths.root, "backend/seed/resume.pdf")
    new aws.s3.BucketObjectv2(
      "ResumeSeed",
      {
        bucket: resumeBucket.name,
        key: "resume.pdf",
        source: new $util.asset.FileAsset(seed),
        contentType: "application/pdf",
        cacheControl: "public, max-age=0, must-revalidate",
        contentDisposition: `inline; filename*=UTF-8''${encodeURIComponent("Osman Sultan - Resume.pdf")}`,
        // Same metadata the API writes (backend/src/resume_api/storage.py).
        metadata: {
          filename: "resume.pdf",
          note: encodeURIComponent("seeded from the repo"),
          sha256: createHash("sha256").update(readFileSync(seed)).digest("hex"),
        },
      },
      { ignoreChanges: ["*"], retainOnDelete: true }
    )
    apiRouter.routeBucket("/resume.pdf", resumeBucket)

    // GitHub OAuth app for the admin sign-in. One app per stage, since an
    // app has a single callback URL: <api url>/auth/github/callback.
    //   bunx sst secret set GithubClientId <id> --stage <stage>
    //   bunx sst secret set GithubClientSecret <secret> --stage <stage>
    const githubClientId = new sst.Secret("GithubClientId")
    const githubClientSecret = new sst.Secret("GithubClientSecret")
    // Signs the session cookie. Generated once per stage and kept in the
    // app's state; nobody has to know it.
    const sessionSecret = new random.RandomPassword("SessionSecret", {
      length: 64,
      special: false,
    })

    // Security headers on every response. Astro's own CSP support does not
    // work with <ClientRouter>, which the site uses, so the policy is set at
    // the CDN and inline scripts stay allowed; external sources are still
    // locked to the site itself and PostHog.
    const posthog = "https://us.i.posthog.com https://us-assets.i.posthog.com"
    const headers = new aws.cloudfront.ResponseHeadersPolicy(
      "SecurityHeaders",
      {
        name: `${$app.name}-${$app.stage}-security-headers`,
        securityHeadersConfig: {
          strictTransportSecurity: {
            accessControlMaxAgeSec: 63072000,
            includeSubdomains: true,
            preload: true,
            override: true,
          },
          contentTypeOptions: { override: true },
          frameOptions: { frameOption: "DENY", override: true },
          referrerPolicy: {
            referrerPolicy: "strict-origin-when-cross-origin",
            override: true,
          },
          contentSecurityPolicy: {
            contentSecurityPolicy: apiUrl.apply((api) =>
              [
                "default-src 'self'",
                `script-src 'self' 'unsafe-inline' ${posthog}`,
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob:",
                "font-src 'self' data:", // PDF.js loads embedded PDF fonts via data: URLs
                // The resume PDF and the admin page's calls go to the API.
                `connect-src 'self' ${posthog} ${api}`,
                "worker-src 'self' blob:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests",
              ].join("; ")
            ),
            override: true,
          },
        },
        customHeadersConfig: {
          items: [
            {
              header: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=(), payment=()",
              override: true,
            },
          ],
        },
      }
    )

    const site = new sst.aws.Astro("Site", {
      // The site is static (see astro.config.mjs), so this is S3 + CloudFront
      // with no Lambda. `warm` and other server options do not apply.
      buildCommand: "bun run build",
      // Where the built site finds the API (src/lib/api.ts).
      environment: { PUBLIC_API_URL: apiUrl },
      edge: {
        viewerRequest: {
          // The resume used to be a file on this domain; keep old links alive.
          injection: $interpolate`if (event.request.uri === "/resume.pdf") return { statusCode: 302, statusDescription: "Found", headers: { location: { value: "${apiUrl}/resume.pdf" } } };`,
        },
      },
      // osmansultan.xyz is registered in Route 53 on the personal account, so
      // SST creates the certificate and DNS records itself. Preview stages stay
      // on their CloudFront URLs.
      domain: isProd
        ? { name: DOMAIN, redirects: [`www.${DOMAIN}`] }
        : undefined,
      transform: {
        cdn: {
          transform: {
            distribution: (args) => {
              args.defaultCacheBehavior = $resolve([
                args.defaultCacheBehavior,
              ]).apply(([b]) => ({ ...b, responseHeadersPolicyId: headers.id }))
              args.orderedCacheBehaviors = $resolve([
                args.orderedCacheBehaviors ?? [],
              ]).apply(([list]) =>
                list.map((b) => ({ ...b, responseHeadersPolicyId: headers.id }))
              )
            },
          },
        },
      },
    })

    new sst.aws.Function("Api", {
      // backend/ is a uv project; SST packages it with uv.
      handler: "backend/src/resume_api/handler.handler",
      runtime: "python3.14",
      architecture: "arm64",
      memory: "1024 MB",
      timeout: "30 seconds",
      // Only what the API does: read and write resume.pdf and its versions.
      // Nothing can delete a version.
      permissions: [
        {
          actions: ["s3:ListBucketVersions"],
          resources: [resumeBucket.arn],
        },
        {
          actions: [
            "s3:GetObject",
            "s3:GetObjectVersion",
            "s3:PutObject",
            // A restore is a server-side copy, which also carries the tag set.
            "s3:GetObjectTagging",
            "s3:GetObjectVersionTagging",
            "s3:PutObjectTagging",
          ],
          resources: [$interpolate`${resumeBucket.arn}/resume.pdf`],
        },
      ],
      environment: {
        RESUME_BUCKET: resumeBucket.name,
        GITHUB_CLIENT_ID: githubClientId.value,
        GITHUB_CLIENT_SECRET: githubClientSecret.value,
        GITHUB_USER_ID: ADMIN_GITHUB_ID,
        SESSION_SECRET: sessionSecret.result,
        API_URL: apiUrl,
        SITE_URL: site.url,
      },
      // CORS is the app's job (it knows the one allowed origin).
      url: { cors: false, router: { instance: apiRouter } },
    })

    return { url: site.url, api: apiUrl }
  },
})
