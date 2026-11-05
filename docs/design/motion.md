# Motion: how things move

All timing comes from `web/src/choreography.js`. Page moves are in `web/src/motion/pages.js`. Do not type new numbers into components; use these.

## The rules

1. **One curve.** Everything eases out: `[0.22, 1, 0.36, 1]` in JS (`EASE`, `CSS_EASE`), `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` in CSS. Never ease in.
2. **Only move `translate`, `scale`, `rotate`, `transform` and `opacity`.** Never animate width, height, top, left or margins. The only exceptions: a 4px blur on page entrances, and `clip-path` for the tab pill and the theme circle. Colours may fade on hover.
3. **Fast.** Feedback under 160ms. Leaving is faster than arriving.
4. **Things used many times a day do not animate** (the Ctrl+K palette, urgent tick lists).
5. **Reduced motion means gentler, not nothing.** Moving stops; short fades stay. Set it per part in CSS (`@media (prefers-reduced-motion: reduce)`), not by setting every time to zero. In JS, `reduced.js` says whether it is on (the computer's setting, or `html[data-motion="reduced"]`); `fx()` then does nothing.

## The time words (`DUR`, in seconds)

press 0.14, release 0.16, hover 0.15, fade 0.2, menuOut 0.2, panel 0.22, crossfade 0.24, rise 0.3, panelOut 0.3, menu 0.36, morph 0.45. CSS has `--dur-press` (140ms) and `--dur-hover` (150ms). Lists stagger 30ms apart, at most 7 items; later ones go together. Springs: `spring()` (0.4s, bounce 0.12) for slide and settle, `MORPH` (0.45s, bounce 0.08), `LAYOUT` (stiffness 420, damping 40, no overshoot) for lists reordering.

## Opening a page

All of this is done by `<Page>`. A page never animates its own arrival.

1. The new page replaces the old one at once. There is no exit animation.
2. The page starts at its top.
3. The title slides up from behind its own bottom edge (`.rise` inside `.rise-mask`, from 110% down): 450ms on the house curve, starting at 80ms. The scope after it follows 60ms later.
4. Then each block rises 12px into place while going from blur 4px and opacity 0 to sharp: 400ms each on the house curve, starting at 160ms, 40ms apart. The 9th block and later start with the 8th. Order is how they sit on screen: top row first, then left to right. Tops within 12px count as one row. Blocks are hidden before the first paint, so nothing flashes.
5. A block is any child of the page grid. Groups (`.kpis`, `.stats`, `.greeting`) give each tile its own turn.
6. Blocks below the screen rise when you scroll to them. Blocks that arrive late (data loaded) rise when they appear. These later batches start at once, still 40ms apart.
7. A full page has landed in about 850ms.

## Numbers count up

Any KPI or stat that is a single number (`3`, `96%`, `6.5 h`, `US$0.02`) climbs from 0 when its block starts to rise, over 0.7s on the house curve. On refresh it glides from the old number to the new. It never shows more decimal places than the real number. Screen readers hear only the final number. Use `CountUp` or `Countable` from `charts.jsx`.

## The tab pill

One accent pill sits behind the tab row. It is one element as wide as the row, shown only between two `clip-path` edges. On a page change it stretches to the new tab: the front edge moves in 200ms (power3.out, `cubic-bezier(0.215, 0.61, 0.355, 1)`), the back edge follows in 300ms (power3.inOut, `cubic-bezier(0.645, 0.045, 0.355, 1)`). So it stretches, then catches up. On a window resize, or under reduced motion, it jumps. On a page with no tab it hides.

## Theme switch

The new theme grows in a circle from the theme button over 450ms on the house curve (View Transitions, `clip-path: circle()` on the new view). If the browser cannot do this, or reduced motion is on, it switches at once.

## Small things

| Thing | Motion |
|---|---|
| Button press | `scale: 0.97` in 140ms, eases back on release |
| Calendar event press | `scale: 0.98` |
| Hover colours | background and colour in 150ms |
| Tooltip | fades and grows from 0.96 in 0.14s, from the edge nearest its trigger. When "warm", no animation |
| Popover and picker list | fades and grows from 0.96 in 0.18s, from its trigger |
| Toast | rises 12px and fades in over 0.25s; drops 6px and fades out over 0.15s |
| Switch | thumb slides in 0.2s; while pressed it stretches (`scale: 1.2 1`) away from its resting edge |
| Hold button | fill grows with `scaleX` over 1.2s; let go early and it unwinds over 200ms |
| Row highlight | slides between rows in 0.24s and fades in 150ms; only follows a mouse, never a tap; its height jumps |
| New live row in a table | slides down 6px and fades in over 0.36s. The first load of a table does not animate |
| Chevrons (picker, disclosure rows) | turn 180° in 150ms on open |
| Card edit tool row | fades in over 0.2s |
| Progress bar | `scaleX` over 0.4s |
| Task chip | fill eases from 4% toward 90% over the expected time (1.5s by default); done fills in 0.2s; failed shakes once in 450ms (-6, 5, -3, 2px) |
| Skeleton | shimmer every 1.6s |
| Spinner | one turn every 0.7s, linear |

## Drag and drop

- **Picking up:** a pointer drag starts only from a drag handle, or after the pointer moves 5px. The thing lifts: a card to `scale: 1.02`, a small chip copy to 1.04 in 120ms, plus the drag shadow (`look.md`). A chip's own spot dims to 45%.
- **Over a good spot:** that spot gets a dashed accent outline.
- **Dropping:** it settles from `scale: 0.96` to 1 over 180ms.
- **Bad drop, or Escape:** it springs back to where it started over 200ms.
- **Others making room:** other cards slide out of the way in 0.22s (`DUR.panel`) on the house curve, using transforms only (framer-motion `layout="position"`).
- Touch scrolls the page except on a drag handle. Keyboard moves (Move up, Move down buttons) never animate. A polite live region says each move ("moved to position 3 of 8"). Reduced motion: no animation.

## Rotating screens (wall TV)

Screens change every 15s. A 4px accent bar on a `--border-strong` track shows the time left (`scaleX`, linear). Only the automatic change crossfades (old out and new in together, opacity 0.4s). Buttons and keys change screens at once: Left and Right step, Space pauses. Reduced motion drops the crossfade and hides the bar.

## Map pulses

On a live map, each event is one crisp dot travelling along a line in 0.7s, ending in a ring on the node over 0.6s (colours are the `--ev-*` tokens). Lines active in the last 60s carry two faint slow dots (2.6s per trip, at most 60 lines). A door read on a plan pulses a 3px ring from scale 1 to 1.6 while fading from 0.8 to 0 over 0.6s (accent, or red when denied). No glow. Under reduced motion the line only lights up briefly.

## Reduced motion, in short

Page blocks fade in place over 200ms; titles just appear. Numbers show their final value. Popovers, tooltips and new table rows fade over 150ms. Toasts fade without moving. The tab pill, row highlight, switch thumb, chevrons and progress bars jump. Presses do not shrink. The hold fill and task fill jump instead of growing; the failed shake is gone. Spinners slow to 1.4s. The theme switches at once. Drags, rotations and pulses do not animate.
