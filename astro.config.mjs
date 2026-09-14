// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import react from "@astrojs/react"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import aws from "astro-sst"

// https://astro.build/config
export default defineConfig({
  // Canonical origin; used for the sitemap, canonical links and Open Graph URLs.
  site: "https://osmansultan.xyz",
  // Static output (the default); astro-sst only writes the build metadata SST
  // needs to deploy dist/ to S3 + CloudFront. No Lambda is created.
  output: "static",
  adapter: aws(),
  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle react-pdf when the dev server starts. Left to discovery, Vite
    // finds it on the first visit to /resume, rebundles mid-navigation and
    // aborts the island's import, which leaves the page on "loading the pdf".
    optimizeDeps: { include: ["react-pdf"] },
  },
  // mdx: logbook posts can import components (see src/content/logbook).
  // Its code fences are rendered by the CodeBlock island (code-fence.astro),
  // which highlights on the client, so Shiki is off for .mdx only.
  integrations: [react(), mdx({ syntaxHighlight: false }), sitemap()],
  markdown: {
    // Logbook code blocks. Both themes are emitted as CSS variables and
    // global.css picks one by the `.dark` class (no default colour).
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
    },
  },
  fonts: [
    {
      // Prince of Persia display font, used only for the home page hero.
      provider: fontProviders.local(),
      name: "Prince of Persia",
      cssVariable: "--font-prince-of-persia",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            // WOFF2 build of the TTF kept alongside it (fonttools); about half the bytes.
            src: ["./src/assets/fonts/princeofpersia.woff2"],
          },
        ],
      },
    },
  ],
})
