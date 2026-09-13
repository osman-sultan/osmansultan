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

/**
 * The resume PDF rendered on the page (as in v2 of the site), every page at
 * the container's width, with the text layer on top so it can be selected
 * and searched. If the PDF cannot be rendered the fallback is a plain link.
 */
export function ResumeViewer({ file }: { file: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()
  const [pages, setPages] = useState(0)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => setWidth(Math.floor(el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={host} className="flex w-full flex-col gap-4">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
        loading={<p className="text-muted-foreground">loading the pdf…</p>}
        error={
          <p className="text-muted-foreground">
            the pdf could not be rendered here.{" "}
            <a href={file} className={linkClass}>
              open it directly
            </a>
            .
          </p>
        }
      >
        {width
          ? Array.from({ length: pages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={width}
                devicePixelRatio={Math.min(2, window.devicePixelRatio || 1)}
                className="border border-border bg-white shadow-sm"
              />
            ))
          : null}
      </Document>
    </div>
  )
}
