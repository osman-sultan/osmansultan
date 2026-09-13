/// <reference path="./.sst/platform/config.d.ts" />

// Personal AWS account only. The profile below must never point at a work
// account; `sst deploy --stage production` uses it directly. AWS_PROFILE in the
// environment overrides this value, so keep that variable unset.
// SST Console Autodeploy sets SST_AWS_NO_PROFILE, which makes SST ignore this
// value and use the build role instead, so it is safe to set unconditionally.
const AWS_PROFILE = "osman-personal"
// Where AWS Budgets sends the monthly spend alerts.
const BUDGET_EMAIL = "osmansultan2002@gmail.com"

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
      // The default runner installs with npm, but this repo only has bun.lock.
      // Same shape as the docs' pnpm example: install the package manager
      // globally, then use it. SST_STAGE is already set in the build.
      async workflow({ $, event }) {
        await $`npm i -g bun`
        await $`bun install --frozen-lockfile`
        if (event.action === "removed") {
          await $`bun sst remove`
        } else {
          await $`bun sst deploy`
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

    // Security headers on every response. Astro's own CSP support does not
    // work with <ClientRouter>, which the site uses, so the policy is set at
    // the CDN and inline scripts stay allowed; external sources are still
    // locked to the site itself and PostHog.
    const posthog = "https://us.i.posthog.com https://us-assets.i.posthog.com"
    const headers = new aws.cloudfront.ResponseHeadersPolicy("SecurityHeaders", {
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
          contentSecurityPolicy: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' ${posthog}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            `connect-src 'self' ${posthog}`,
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
          ].join("; "),
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
    })

    const site = new sst.aws.Astro("Site", {
      // The site is static (see astro.config.mjs), so this is S3 + CloudFront
      // with no Lambda. `warm` and other server options do not apply.
      buildCommand: "bun run build",
      // osmansultan.xyz is registered in Route 53 on the personal account, so
      // SST creates the certificate and DNS records itself. Preview stages stay
      // on their CloudFront URLs.
      domain: isProd
        ? { name: "osmansultan.xyz", redirects: ["www.osmansultan.xyz"] }
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

    return { url: site.url }
  },
})
