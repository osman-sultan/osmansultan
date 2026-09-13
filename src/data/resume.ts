/**
 * Resume content for the /resume page. The PDF (public/resume.pdf) is built
 * by CI from resume/resume.tex, which is maintained separately; keep the two
 * in step when either changes.
 */

export type Entry = {
  title: string
  org: string
  orgUrl?: string
  place: string
  dates: string
  bullets: string[]
}

export const contact = {
  email: "osmansultan2002@gmail.com",
  linkedin: { label: "linkedin.com/in/osmansultan-", url: "https://linkedin.com/in/osmansultan-" },
  github: { label: "github.com/osman-sultan", url: "https://github.com/osman-sultan" },
  pdf: "/resume.pdf",
}

export const education: Entry[] = [
  {
    title: "MS in Computer Science, Computing Systems & Machine Learning",
    org: "Georgia Institute of Technology",
    place: "Atlanta, GA",
    dates: "Expected 2027",
    bullets: ["GPA 4.0", "Relevant coursework: Operating Systems"],
  },
  {
    title: "BASc in Industrial Engineering, Minor in Artificial Intelligence",
    org: "University of Toronto",
    place: "Toronto, ON",
    dates: "2025",
    bullets: [
      "Relevant coursework: Operations Research, OOP, DSA, Stats/Probability, Big Data Mining, Deep Learning, Recommender Systems, Information Retrieval, Databases, Reinforcement Learning, Optimization in ML",
    ],
  },
]

export const skills: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "TypeScript", "Java", "C", "C++", "SQL"] },
  {
    label: "Frameworks & runtimes",
    items: [
      "React/Next.js",
      "Astro",
      "Hono",
      "Node.js",
      "Bun",
      "FastAPI",
      "Spring Boot",
      "PyTorch",
      "Scikit-learn",
      "Pandas",
      "NumPy",
    ],
  },
  {
    label: "AI & agents",
    items: [
      "Claude Code as an agent harness (custom skills, MCP servers, tool design)",
      "OpenAI Agents SDK",
      "Model Context Protocol",
      "embeddings/RAG",
      "LLM evals",
    ],
  },
  {
    label: "Cloud & tools",
    items: [
      "AWS (CDK/CloudFormation, Lambda, ECS/Fargate, API Gateway, CloudFront, S3, Aurora RDS, SQS, Cognito, Secrets Manager, CloudWatch)",
      "SST",
      "Azure",
      "Docker",
      "Git",
      "GitHub Actions",
    ],
  },
]

export const experience: Entry[] = [
  {
    title: "Software Engineer",
    org: "Atrios",
    orgUrl: "https://atrios.com",
    place: "Toronto, ON",
    dates: "Sept 2025 – present",
    bullets: [
      "Own features end to end that helped scale an a16z speedrun-backed B2B referral marketplace to $2M ARR, spanning the matching algorithm, Stripe payments and payouts, multi-tenant auth, CRM and calendar integrations, and the vendor, connector, lead, and admin experiences in Next.js and Hono.",
      "Develop and scale the AWS backend with CDK infrastructure-as-code (ECS Fargate, Aurora, SQS), including a PostHog-instrumented, multi-signal scoring system that predicts intent across 250 booked meetings per month and drives conversion-weighted payouts.",
      "Lead adoption of agentic engineering on Claude Code, writing custom skills and CLI tooling that automate CI/CD, PR review, ticket tracking, and live-site E2E testing, with engineers owning design and agents handling routine work.",
    ],
  },
  {
    title: "Software Engineer Intern",
    org: "HealthTap",
    orgUrl: "https://www.healthtap.com",
    place: "Sunnyvale, CA",
    dates: "June 2025 – Sept 2025",
    bullets: [
      "Built an agentic voice assistant for primary care with the OpenAI Agents SDK realtime model and Twilio, automating patient support calls for 2M+ monthly users with guardrails designed around patient safety and privacy.",
      "Designed tools and context for internal Model Context Protocol servers that automated customer support ticket triage.",
    ],
  },
  {
    title: "Software Engineer (Capstone)",
    org: "Ploopy Corporation",
    orgUrl: "https://ploopy.co",
    place: "Toronto, ON",
    dates: "Sept 2024 – Apr 2025",
    bullets: [
      "Automated customer email responses using Azure App Service, Logic Apps, and Microsoft Graph API, reducing handling time from days to under 32 seconds.",
      "Developed an email matching and ranking engine with Azure OpenAI embeddings and cosine similarity in a FastAPI backend for customer inquiry processing.",
    ],
  },
  {
    title: "Full Stack Engineer Intern",
    org: "Doctalk Inc.",
    orgUrl: "https://doctalk.com",
    place: "Toronto, ON",
    dates: "Sept 2023 – Apr 2024",
    bullets: [
      "Designed and implemented event-driven architecture for real-time systems using Redis pub-sub and Supabase, building messaging and notifications from the ground up.",
      "Migrated data models from RedisGraph to PostgreSQL by designing relational schemas that resolved structural incompatibilities while maintaining 100% uptime.",
      "Built type-safe REST APIs with Node.js and TypeScript implementing role-based authentication and PostgreSQL row-level security (RLS) for flagship application features.",
      "Developed responsive frontend components with React (Next.js), Context for state management, and Tailwind CSS that increased daily active users by 50%.",
    ],
  },
  {
    title: "Software Developer Intern",
    org: "Molex LLC",
    orgUrl: "https://molex.com",
    place: "Waterloo, ON",
    dates: "June 2022 – Sept 2022",
    bullets: [
      "Transformed a legacy embedded CLI into a web app using Python, FastAPI, and Jinja, reducing testing times by 50%.",
      "Leveraged Python's asyncio to allow multi-user concurrent testing, enhancing developer experience.",
    ],
  },
]
