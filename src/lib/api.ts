// Where the resume API (backend/) is reached. It holds the resume PDF and
// its history. PUBLIC_API_URL is set by sst.config.ts for preview stages;
// without it, development talks to a local `uvicorn` and builds to production.
export const API_URL: string =
  import.meta.env.PUBLIC_API_URL ??
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://api.osmansultan.xyz")

/** The current resume. Public, and replaced the moment a new one is uploaded. */
export const RESUME_PDF_URL = `${API_URL}/resume.pdf`
