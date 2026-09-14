/**
 * Small polyfills for browsers a step behind, imported before any module
 * that needs them (ESM evaluates imports in order).
 *
 * - Promise.withResolvers: used by PDF.js; missing on iOS Safari before 17.4.
 */
if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}
