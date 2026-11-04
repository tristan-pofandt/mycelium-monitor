// Moving between pages, modelled on the two reference clips Tristan chose on 2026-11-01:
//   * the active nav pill stretches to its new tab: the leading edge goes first and fast, the trailing edge catches up;
//   * the old page blurs out and the new page's cards resolve from blur, one after another;
//   * switching theme reveals the new theme in a circle growing from the toggle.
// Everything runs as Web Animations or View Transitions (off the main thread where the browser allows), and does nothing
// under reduced motion. Page-element timing comes from choreography.js; the pill's two edge curves are from the clip and
// live here because they exist for this one gesture.
import { CSS_EASE, DUR, fx, slow } from "../choreography.js";
import { reducedMotion } from "../reduced.js";
import { cubicBezier } from "framer-motion";

const LEAD = { ms: 200, ease: cubicBezier(0.215, 0.61, 0.355, 1) }; // power3.out
const TRAIL = { ms: 300, ease: cubicBezier(0.645, 0.045, 0.355, 1) }; // power3.inOut: the edge that follows lags, then settles (shortened 2026-11-04: a tab click is frequent)
const FRAMES = 24;

// The pill is one element across the whole tab row, shown only between two clip edges (in px from the row's left and right).
const clip = (box, l, r) => `inset(${box.top}px ${r}px ${box.bottom}px ${l}px round 999px)`;

export function edgesOf(row, tab) {
  const w = row.scrollWidth, h = row.clientHeight;
  return { l: tab.offsetLeft, r: w - (tab.offsetLeft + tab.offsetWidth), top: tab.offsetTop, bottom: h - (tab.offsetTop + tab.offsetHeight) };
}

// Move the pill from `from` to `to` edges. Returns the running animation, or null when it was placed without one.
export function movePill(pill, from, to) {
  pill.getAnimations().forEach((a) => a.cancel());
  pill.style.clipPath = clip(to, to.l, to.r);
  if (!from || reducedMotion() || (from.l === to.l && from.r === to.r)) return null;
  const right = to.l > from.l; // moving right: the right edge leads
  const s = slow(), total = Math.max(LEAD.ms, TRAIL.ms) * s;
  const edge = (a, b, curve, t) => a + (b - a) * curve.ease(Math.min(1, t / (curve.ms * s)));
  const frames = Array.from({ length: FRAMES + 1 }, (_, i) => {
    const t = (i / FRAMES) * total;
    const l = edge(from.l, to.l, right ? TRAIL : LEAD, t), r = edge(from.r, to.r, right ? LEAD : TRAIL, t);
    const top = edge(from.top, to.top, LEAD, t), bottom = edge(from.bottom, to.bottom, LEAD, t);
    return { offset: i / FRAMES, clipPath: clip({ top, bottom }, l, r) };
  });
  return pill.animate(frames, { duration: total, easing: "linear" });
}

// Entrance: the shape of the reference clip (title slides up out of a mask, then blocks rise from blur one after another),
// tightened on 2026-11-04 after an animation review: a dashboard page is opened tens of times a day, so the title takes 450 ms,
// blocks 400 ms each, 40 ms apart for up to 8, and the page has landed within about 850 ms.
const ENTER = { delay: 80, title: 450, block: 400, step: 40, rise: 12, cap: 8, row: 12 };
// Blocks are the page's own pieces: every child of the page grid, except that a group of tiles (KPIs, stats, the greeting)
// gives each tile its own turn. Nothing is left out by class name, so a table, notice or list rises like a card does.
const GROUPS = ".kpis, .stats, .greeting";
export const REVEAL = "page:reveal"; // fired on a block as its entrance is scheduled; detail.delay in ms (CountUp waits for it)

export function blocksOf(root) {
  const out = [];
  for (const el of root.children) {
    if (el.matches(".page-head")) continue; // the title rises on its own track
    if (el.matches(GROUPS)) out.push(...[...el.children].filter((c) => !c.matches("h1, .rise-mask") && !c.querySelector(":scope > .rise-mask")));
    else out.push(el);
  }
  return out;
}

// Reading order on screen, not in the source: rows top to bottom (tops within ENTER.row px share a row), then left to right.
export function byPlacement(els) {
  const at = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
  return [...els].sort((a, b) => {
    const ra = at.get(a), rb = at.get(b);
    return Math.abs(ra.top - rb.top) > ENTER.row ? ra.top - rb.top : ra.left - rb.left;
  });
}

// Every page opens the same way, through <Page>: it starts at the top; titles rise once; blocks reveal top left to bottom
// right as they come into view (those on screen at once, those that arrive when data loads, those below the fold on scroll),
// each hidden the moment it is added. A number inside a block (CountUp) starts climbing when its block starts to rise.
export function pageEnter(root) {
  if (!root) return null;
  if (!location.hash) scrollTo(0, 0); // a new page starts at its top, so the first thing to move is the first thing on it
  const s = slow();
  const titles = fx(root.querySelectorAll(".rise"), [{ translate: "0 110%" }, { translate: "0 0" }], {
    duration: ENTER.title * s, delay: ENTER.delay * s, step: 60 * s, easing: CSS_EASE, props: ["translate"],
    done: (el) => el.style.removeProperty("translate"),
  });
  if (reducedMotion()) { // gentler, not none: blocks fade in place, nothing moves
    blocksOf(root).forEach((el) => el.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: CSS_EASE }));
    return { stop() {} };
  }
  if (typeof IntersectionObserver === "undefined") return { stop() { titles.stop(); } };
  const props = ["translate", "opacity", "filter"], running = new Set(), seen = new WeakSet(), queue = [];
  let first = true;
  const reveal = (entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); } });
    const batch = byPlacement(queue.splice(0).filter((el) => el.isConnected));
    if (!batch.length) return;
    const delay = (first ? ENTER.delay + 80 : 0) * s, step = ENTER.step * s;
    batch.forEach((el, i) => {
      el.style.removeProperty("opacity"); // the animation holds it at 0 until its turn
      el.dataset.reveal = "done";
      el.dispatchEvent(new CustomEvent(REVEAL, { detail: { delay: delay + Math.min(i, ENTER.cap - 1) * step } })); // fx's own formula
    });
    const run = fx(batch, [
      { translate: `0 ${ENTER.rise}px`, opacity: 0, filter: "blur(4px)" },
      { translate: "0 0", opacity: 1, filter: "blur(0px)" },
    ], { duration: ENTER.block * s, delay, step, cap: ENTER.cap, easing: CSS_EASE, props, done: (el) => props.forEach((p) => el.style.removeProperty(p)) });
    first = false;
    running.add(run);
    run.finished.then(() => running.delete(run));
  };
  const io = new IntersectionObserver(reveal);
  const scan = () => blocksOf(root).forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    el.style.opacity = "0"; // hidden before the browser paints it
    el.dataset.reveal = "wait";
    io.observe(el);
  });
  const mo = new MutationObserver(scan);
  scan();
  mo.observe(root, { childList: true, subtree: true });
  return { stop() { mo.disconnect(); io.disconnect(); titles.stop(); running.forEach((r) => r.stop()); } };
}

// No exit animation: the leaving page is replaced at once. A 90 ms blur-out used to run first, and as it ended the old page
// was drawn again for a frame before unmounting (a visible flicker); the new page's own entrance does the work.

// Theme switch: the new theme grows in a circle from the button (View Transitions; an instant switch where unsupported).
export function revealTheme(fromEl, apply) {
  if (reducedMotion() || !document.startViewTransition || !fromEl) { apply(); return; }
  const r = fromEl.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(apply);
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: DUR.morph * 1000 * slow(), easing: CSS_EASE, pseudoElement: "::view-transition-new(root)" },
    );
  }).catch(() => {});
}
