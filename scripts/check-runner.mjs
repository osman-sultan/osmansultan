// Drives one headless Chrome over CDP (no deps; Node's global WebSocket) to
// check the runner boots, responds to a tap/click, and rewinds on a dagger
// hold, at a phone and a desktop size. Usage: node cdp-runner-check.mjs <url> <outdir>
import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const [url, outDir] = process.argv.slice(2)
const CHROME =
  process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe"
const PORT = 9333
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(outDir, "chrome-profile")}`,
    "about:blank",
  ],
  { stdio: "ignore" }
)
process.on("exit", () => chrome.kill())

async function waitForChrome() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return
    } catch {}
    await sleep(200)
  }
  throw new Error("chrome did not start")
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
      }
    }
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((res, rej) => this.pending.set(id, { res, rej }))
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    return r.result.value
  }
}

async function openTab() {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: "PUT",
  })
  const t = await r.json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((res) => (ws.onopen = res))
  return { cdp: new Cdp(ws), id: t.id }
}

const CANVAS = `document.querySelector("[data-runner-canvas]")`
const state = (cdp) =>
  cdp.eval(`(() => { const c = ${CANVAS}; const r = c.getBoundingClientRect();
    return { init: c.dataset.runnerInit || null, state: c.dataset.runnerState || null,
      dist: c.dataset.runnerDist, sand: c.dataset.runnerSand,
      css: [Math.round(r.width), Math.round(r.height)], buf: [c.width, c.height],
      top: Math.round(r.top), left: Math.round(r.left) } })()`)

async function shot(cdp, file) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(outDir, file), Buffer.from(r.data, "base64"))
}

async function run(name, { width, height, mobile }) {
  const { cdp } = await openTab()
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
  })
  if (mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true })
  await cdp.send("Page.enable")
  await cdp.send("Page.navigate", { url })
  await sleep(3500) // real time: idle callbacks fire
  const s0 = await state(cdp)
  console.log(name, "after load:", JSON.stringify(s0))
  await shot(cdp, `${name}-0-idle.png`)

  // Tap / click the middle of the canvas: idle -> running.
  const cx = s0.left + s0.css[0] / 2
  const cy = s0.top + s0.css[1] / 2
  const press = async (x, y, downOnly = false) => {
    if (mobile) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] })
      if (!downOnly) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
    } else {
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 })
      if (!downOnly) await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 })
    }
  }
  const release = async (x, y) => {
    if (mobile) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
    else await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 })
  }
  await press(cx, cy)
  await sleep(1500)
  const s1 = await state(cdp)
  console.log(name, "after tap:", JSON.stringify(s1))
  await shot(cdp, `${name}-1-running.png`)

  // A second tap mid-run: should jump, not rewind.
  await press(cx, cy)
  await sleep(600)
  const s2 = await state(cdp)
  console.log(name, "after 2nd tap:", JSON.stringify(s2))

  // Hold the HUD dagger (top-left): running -> rewinding.
  // Logical px per CSS px: the canvas height is always the world's 250.
  const k = s1.css[1] / 250
  const hudTop = 36
  const dx = s1.left + (8 + 48) * k
  const dy = s1.top + (hudTop + 14 + 12) * k
  await press(dx, dy, true)
  await sleep(500)
  const s3 = await state(cdp)
  console.log(name, "holding dagger:", JSON.stringify(s3))
  await shot(cdp, `${name}-2-rewind.png`)
  await release(dx, dy)
  await sleep(400)
  const s4 = await state(cdp)
  console.log(name, "released:", JSON.stringify(s4))
  cdp.ws.close()
}

await waitForChrome()
try {
  await run("mobile", { width: 390, height: 844, mobile: true })
  await run("desktop", { width: 1280, height: 1000, mobile: false })
} finally {
  chrome.kill()
}
