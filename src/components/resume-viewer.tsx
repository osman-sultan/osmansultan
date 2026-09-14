import "@/lib/polyfills"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// PDF.js renders in a worker; Vite emits it as its own file next to the
// page scripts, so it is served from this origin and allowed by the CSP.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

const linkClass =
  "text-link underline underline-offset-4 transition-opacity hover:opacity-70"

// A US-letter-shaped box in the theme's card colour: what shows while the
// PDF loads, and what the rendered page sits on. `.resume-sheet` (global.css)
// puts an offset gradient slab behind it, the v2 look in this site's palette.
const sheetClass = "resume-sheet relative aspect-[17/22] w-full bg-card"

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sheetClass} flex items-center justify-center`}>
      <p className="px-6 text-center text-muted-foreground">{children}</p>
    </div>
  )
}

/**
 * The resume PDF rendered on the page (as in v2 of the site), every page at
 * the container's width, with the text layer on top so it can be selected
 * and searched. If the PDF cannot be rendered, the sheet says why and links
 * to the file.
 */
export function ResumeViewer({ file }: { file: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()
  const [pages, setPages] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => setWidth(Math.floor(el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fail = (e: Error) => setError(e.message || String(e))

  return (
    // Right and bottom room for the offset shadow.
    <div ref={host} className="flex w-full flex-col gap-8 pr-[10px] pb-[10px] sm:pr-[14px] sm:pb-[14px]">
      {error ? (
        <Sheet>
          the pdf could not be rendered here ({error}).{" "}
          <a href={file} className={linkClass}>
            open it directly
          </a>
          .
        </Sheet>
      ) : (
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          onLoadError={fail}
          onSourceError={fail}
          loading={<Sheet>loading the pdf…</Sheet>}
          noData={<Sheet>no pdf.</Sheet>}
        >
          {width
            ? Array.from({ length: pages }, (_, i) => (
                <Page
                  key={i}
                  pageNumber={i + 1}
                  width={width}
                  devicePixelRatio={Math.min(2, window.devicePixelRatio || 1)}
                  onRenderError={fail}
                  loading={<Sheet>rendering…</Sheet>}
                  className={sheetClass}
                />
              ))
            : null}
        </Document>
      )}
    </div>
  )
}
