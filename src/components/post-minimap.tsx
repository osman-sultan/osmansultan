import { useRef, useSyncExternalStore } from "react"

import ProximitySidebar, {
  type ProximitySection,
} from "@/components/ui/proximity-sidebar"

/**
 * Feeds the rare-ui ProximitySidebar with the post's reading structure, the
 * way its docs do: the title, each h2/h3, and every body block (paragraph,
 * code, list, table, quote, image) as a short muted dash. The blocks are read
 * from the rendered post on the client, so this works for .md and .mdx alike;
 * blocks without an id get one so the dashes can scroll to them.
 */

const EMPTY: ProximitySection[] = []
const BLOCKS =
  "#post-title, [data-post] .prose > :is(h2, h3, h4, p, pre, ul, ol, table, blockquote, figure, img, div)"

function kindOf(el: HTMLElement): ProximitySection["kind"] {
  if (el.id === "post-title") return "title"
  const tag = el.tagName.toLowerCase()
  if (tag === "h2") return "subtitle"
  if (tag === "h3" || tag === "h4") return "section"
  return "body"
}

function scan(): ProximitySection[] {
  const els = document.querySelectorAll<HTMLElement>(BLOCKS)
  const sections: ProximitySection[] = []
  els.forEach((el, i) => {
    if (!el.id) el.id = `block-${i}`
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim()
    sections.push({
      id: el.id,
      label: text.slice(0, 60) || el.tagName.toLowerCase(),
      kind: kindOf(el),
    })
  })
  return sections
}

const noop = () => () => {}

export function PostMinimap(props: {
  side?: "left" | "right"
  activeOffset?: number
}) {
  // The server renders nothing (it has no DOM); the client scans once after
  // hydration and keeps that list. useSyncExternalStore keeps both renders
  // consistent without a setState-in-effect.
  const cache = useRef<ProximitySection[] | null>(null)
  const sections = useSyncExternalStore(
    noop,
    () => (cache.current ??= scan()),
    () => EMPTY
  )
  if (!sections.length) return null
  return <ProximitySidebar sections={sections} {...props} />
}
