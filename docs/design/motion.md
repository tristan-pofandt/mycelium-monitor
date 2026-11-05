# Motion: how things move

All timing comes from `web/src/choreography.js`. Page moves are in `web/src/motion/pages.js`. Do not type new numbers into components; use these.

## The rules

1. **One curve.** Everything eases out: `[0.22, 1, 0.36, 1]` in JS (`EASE`, `CSS_EASE`), `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` in CSS. Never ease in.
2. **Only move `translate`, `scale`, `transform` and `opacity`.** Never animate width, height, top, left or margins. The one exception is a 4px blur on page entrances.
3. **Fast.** Feedback under 160ms. Leaving is faster than arriving.
4. **Things used many times a day do not animate** (the Ctrl+K palette, urgent tick lists).
5. **Reduced motion means gentler, not nothing.** Moving stops; short fades stay. Set it per part in CSS, not by setting every time to zero. `reduced.js` says whether it is on (the computer's setting, or `html[data-motion="reduced"]`).

## The time words (`DUR`, in seconds)

press 0.14, release 0.16, hover 0.15, fade 0.2, panel 0.22, crossfade 0.24, rise 0.3, menu 0.36, morph 0.45. Lists stagger 30ms apart, at most 7 items; later ones go together. Springs: `spring()` (0.4s, bounce 0.12) for slide and settle, `MORPH` (0.45s, bounce 0.08), `LAYOUT` (stiffness 420, damping 40, no overshoot) for lists reordering.

## Opening a page

All of this is done by `<Page>`. A page never animates its own arrival.

1. The new page replaces the old one at once. There is no exit animation.
2. The page starts at its top.
3. The title slides up from behind its own bottom edge (`.rise` inside `.rise-mask`): 450ms, starting at 80ms.
4. Then each block rises 12px into place while going from blur 4px and opacity 0 to sharp: 400ms each, starting at 160ms, 40ms apart, at most 8 staggered. Order is how they sit on screen: top row first, then left to right. Tops within 12px count as one row.
5. A block is any child of the page grid. Groups (`.kpis`, `.stats`, `.greeting`) give each tile its own turn.
6. Blocks below the screen rise when you scroll to them. Blocks that arrive late (data loaded) rise when they appear.
7. A full page has landed in about 850ms.

## Numbers count up

Any KPI or stat that is a single number (`3`, `96%`, `6.5 h`, `US$0.02`) climbs from 0 when its block starts to rise, over 0.7s. On refresh it glides from the old number to the new. It never shows more decimal places than the real number. Screen readers hear only the final number. Use `CountUp` or `Countable` from `charts.jsx`.

## The tab pill

One accent pill sits behind the tab row. On a page change it stretches to the new tab: the front edge moves in 200ms (power3.out), the back edge follows in 300ms (power3.inOut). So it stretches, then catches up. Under reduced motion it jumps.

## Theme switch

The new theme grows in a circle from the theme button over 450ms (View Transitions). If the browser cannot do this, or reduced motion is on, it switches at once.

## Small things

| Thing | Motion |
|---|---|
| Button press | `scale: 0.97` in 140ms, eases back on release |
| Calendar event press | `scale: 0.98` |
| Hover colours | background and colour in 150ms |
| Tooltip | fades and grows from 0.96 in 0.14s, from the side nearest its trigger. When "warm", no animation |
| Popover and picker list | fades and grows from 0.96 in 0.18s, from its trigger |
| Toast | rises 12px and fades in over 0.25s; fades out over 0.15s |
| Switch | thumb slides in 0.2s; while pressed it stretches (`scale: 1.2 1`) away from its resting edge |
| Hold button | fill grows with `scaleX` over 1.2s; let go early and it unwinds over 200ms |
| Row highlight | slides between rows in 0.24s; only follows a mouse, never a tap; its height jumps |
| New live row in a table | slides in 6px over 0.36s. The first load of a table does not animate |
| Picker chevron | turns 180° on open |
| Progress bar | `scaleX` over 0.4s |
| Task chip | fill eases toward 90%; done snaps full; failed shakes once in 450ms |
| Skeleton | shimmer every 1.6s |

## Drag and drop

- **Picking up:** the thing being dragged lifts: `scale` 1.02 to 1.04 in 120ms, plus the tooltip shadow. The place it came from dims.
- **Over a good spot:** that spot gets a dashed accent outline.
- **Dropping:** it settles from `scale: 0.96` to 1 over 180ms.
- **Bad drop:** it springs back to where it started over 200ms.
- **Others making room:** other cards slide out of the way in 0.22s (`DUR.panel`) on the house curve, using transforms only (framer-motion `layout="position"`).
- Touch still scrolls the page. Keyboard moves (Move up, Move down buttons) never animate. A polite live region says each move. Reduced motion: no animation.

## Rotating screens (wall TV)

Screens change every 15s. A 4px accent bar along the bottom shows the time left (`scaleX`, linear). Only the automatic change crossfades (opacity 0.4s). Buttons and keys change screens at once. Reduced motion drops both.

## Map pulses

On a live map, each event is one crisp dot travelling along a line, ending in a ring on the node (read teal, write accent, outside orange, error red). Lines active in the last 60s carry two faint slow dots (2.6s per trip, at most 60 lines). A door read on a plan pulses a ring from 1 to 1.6 and fades over 0.6s. No glow. Under reduced motion the line only lights up briefly.

## Reduced motion, in short

Page blocks fade in place over 200ms. Popovers and tooltips fade over 150ms. Toasts fade without rising. The tab pill jumps. Presses do not shrink. The theme switches at once. Drags, rotations and pulses do not animate.
