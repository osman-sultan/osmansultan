import { useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** One entry in the resume's history (backend/src/resume_api/models.py). */
type Version = {
  id: string
  number: number
  uploaded_at: string
  size: number
  is_current: boolean
  filename: string | null
  note: string | null
  restored_from: string | null
}

type Session = "checking" | "signed-out" | "signed-in"
type Notice = { kind: "ok" | "error"; text: string }

// Same limits as the API, checked here first so a bad file never leaves.
const MAX_BYTES = 4 * 1024 * 1024
const NOTE_MAX = 200

const SIGN_IN_ERRORS: Record<string, string> = {
  denied: "that github account is not allowed in here.",
  signin: "the sign-in did not complete. try again.",
}

const linkClass =
  "text-link underline underline-offset-4 transition-opacity hover:opacity-70"

const when = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

class SignedOutError extends Error {}

/** A failed GitHub sign-in comes back as /admin?error=<code>. */
function signInError(): Notice | null {
  const error = new URLSearchParams(window.location.search).get("error")
  if (!error) return null
  return { kind: "error", text: SIGN_IN_ERRORS[error] ?? SIGN_IN_ERRORS.signin }
}

/** Call the API with the session cookie; throws with the API's message. */
async function request(api: string, path: string, init?: RequestInit) {
  let response: Response
  try {
    response = await fetch(`${api}${path}`, { ...init, credentials: "include" })
  } catch {
    throw new Error("could not reach the api.")
  }
  if (response.status === 401) throw new SignedOutError("signed out.")
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = typeof body?.detail === "string" ? body.detail : null
    throw new Error(detail ?? `the api answered ${response.status}.`)
  }
  return response
}

async function fetchVersions(api: string) {
  const response = await request(api, "/resume/versions")
  return (await response.json()) as Version[]
}

export function ResumeAdmin({ api }: { api: string }) {
  const [session, setSession] = useState<Session>("checking")
  const [versions, setVersions] = useState<Version[]>([])
  const [notice, setNotice] = useState<Notice | null>(signInError)

  useEffect(() => {
    // The sign-in error, if any, is already on screen; clean the address bar.
    const url = new URL(window.location.href)
    if (url.searchParams.has("error")) {
      url.searchParams.delete("error")
      window.history.replaceState(null, "", url)
    }
    // The history doubles as the session check: it answers 401 if signed out.
    fetchVersions(api).then(
      (loaded) => {
        setVersions(loaded)
        setSession("signed-in")
      },
      (e: Error) => {
        setSession("signed-out")
        if (!(e instanceof SignedOutError))
          setNotice({ kind: "error", text: e.message })
      }
    )
  }, [api])

  const call = (path: string, init?: RequestInit) => request(api, path, init)
  const reload = async () => setVersions(await fetchVersions(api))

  const run = async (action: () => Promise<string>) => {
    setNotice(null)
    try {
      const text = await action()
      setNotice({ kind: "ok", text })
    } catch (e) {
      // The session ran out mid-way: back to the sign-in button.
      if (e instanceof SignedOutError) setSession("signed-out")
      else setNotice({ kind: "error", text: (e as Error).message })
    }
  }

  const signOut = () =>
    run(async () => {
      await call("/auth/logout", { method: "POST" })
      setSession("signed-out")
      setVersions([])
      return "signed out."
    })

  if (session === "checking") {
    return <p className="text-muted-foreground">checking…</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={cn(
            "border-l-2 py-1 pl-3",
            notice.kind === "error"
              ? "border-destructive text-destructive"
              : "border-link"
          )}
        >
          {notice.text}
        </p>
      )}

      {session === "signed-out" ? (
        <div>
          <a
            href={`${api}/auth/github`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-foreground/30"
            )}
          >
            sign in with github
          </a>
        </div>
      ) : (
        <>
          <Upload
            onUpload={(file, note) =>
              run(async () => {
                const body = new FormData()
                body.append("file", file)
                if (note) body.append("note", note)
                await call("/resume/versions", { method: "POST", body })
                await reload()
                return "uploaded. the site is serving it now."
              })
            }
          />
          <History
            api={api}
            versions={versions}
            onRestore={(version) =>
              run(async () => {
                await call(`/resume/versions/${version.id}/restore`, {
                  method: "POST",
                })
                await reload()
                return `restored v${version.number}. the site is serving it now.`
              })
            }
          />
          <div>
            <button
              type="button"
              onClick={signOut}
              className={cn(linkClass, "font-mono text-xs")}
            >
              sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Upload({
  onUpload,
}: {
  onUpload: (file: File, note: string) => Promise<void>
}) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [problem, setProblem] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  const choose = (picked: File | undefined) => {
    if (!picked) return
    const isPdf =
      picked.type === "application/pdf" ||
      picked.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      setFile(null)
      setProblem("that file is not a pdf.")
    } else if (picked.size > MAX_BYTES) {
      setFile(null)
      setProblem(`that pdf is larger than ${formatSize(MAX_BYTES)}.`)
    } else {
      setFile(picked)
      setProblem(null)
    }
  }

  const submit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!file || busy) return
    setBusy(true)
    await onUpload(file, note.trim())
    setBusy(false)
    setFile(null)
    setNote("")
    if (input.current) input.current.value = ""
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium">New version</h2>
      <label
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          choose(event.dataTransfer.files[0])
        }}
        className={cn(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 hover:bg-input/30",
          dragging ? "border-link bg-input/40" : "border-foreground/30"
        )}
      >
        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => choose(event.target.files?.[0])}
        />
        {file ? (
          <>
            <span className="max-w-full truncate font-medium">{file.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatSize(file.size)} · click to pick another
            </span>
          </>
        ) : (
          <>
            <span>drop a pdf here, or click to choose one</span>
            <span className="font-mono text-xs text-muted-foreground">
              up to {formatSize(MAX_BYTES)}
            </span>
          </>
        )}
      </label>
      {problem && (
        <p role="alert" className="text-destructive">
          {problem}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={NOTE_MAX}
          placeholder="note (optional), e.g. added the new role"
          aria-label="Note for this version"
          className="h-8 min-w-0 flex-1 basis-56 rounded-md border border-foreground/30 bg-transparent px-2.5 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
        />
        <Button type="submit" size="lg" disabled={!file || busy}>
          {busy ? "uploading…" : "upload"}
        </Button>
      </div>
    </form>
  )
}

function History({
  api,
  versions,
  onRestore,
}: {
  api: string
  versions: Version[]
  onRestore: (version: Version) => Promise<void>
}) {
  // Restore is a two-step button, so one stray click changes nothing.
  const [confirming, setConfirming] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const numberOf = (id: string) => versions.find((v) => v.id === id)?.number

  const restore = async (version: Version) => {
    setBusy(true)
    await onRestore(version)
    setBusy(false)
    setConfirming(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium">History</h2>
      {versions.length === 0 ? (
        <p className="text-muted-foreground">
          nothing yet. the first upload becomes v1.
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-foreground/15 border-y border-foreground/15">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex items-start justify-between gap-x-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono font-medium">
                    v{version.number}
                  </span>
                  {version.is_current && <Badge>current</Badge>}
                  <time
                    dateTime={version.uploaded_at}
                    className="text-muted-foreground"
                  >
                    {when.format(new Date(version.uploaded_at))}
                  </time>
                </div>
                <p className="font-mono text-xs break-words text-muted-foreground">
                  {[
                    version.filename,
                    formatSize(version.size),
                    version.restored_from &&
                      `restored from v${numberOf(version.restored_from) ?? "?"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {version.note && <p className="break-words">{version.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1 font-mono text-xs">
                {confirming === version.id ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-foreground/30"
                      disabled={busy}
                      onClick={() => restore(version)}
                    >
                      {busy ? "restoring…" : "confirm"}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => setConfirming(null)}
                    >
                      cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <a
                      href={`${api}/resume/versions/${encodeURIComponent(version.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      view
                    </a>
                    {!version.is_current && (
                      <Button
                        variant="ghost"
                        onClick={() => setConfirming(version.id)}
                      >
                        restore
                      </Button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
