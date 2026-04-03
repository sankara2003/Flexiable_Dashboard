/**
 * afterPaint(fn)
 *
 * Schedules `fn` to run after the browser has finished painting the current
 * frame and the main thread is idle. This prevents AI insight API calls
 * from competing with the initial render and inflating Total Blocking Time.
 *
 * Uses requestIdleCallback when available (Chrome/Edge/Firefox), with a
 * 3-second timeout so the call still fires on Safari which lacks rIC.
 * Falls back to a single rAF → setTimeout(0) chain which waits for the
 * next paint before yielding to the task queue.
 */
export function afterPaint(fn) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    // rAF fires after next paint; setTimeout(0) then yields to the task queue
    requestAnimationFrame(() => setTimeout(fn, 0));
  }
}
