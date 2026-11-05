# Mycelium design: start here

Every Mycelium product (Ops, Monitor, Commerce) looks, moves and resizes the same way. Only the features differ. This file and `docs/design/` are the whole rulebook. They are identical in every Mycelium repo. The reference build is **Mycelium Ops prototype 1** (`mycelium-ops`, `web/src/demo/`).

## The feeling, in six lines

1. **"The quiet control room."** Big soft cards on a plain ground, lots of space, data you read at a glance.
2. **One accent colour (indigo)** marks the one active thing. Everything else is grey. Green, amber and red only when they mean something.
3. **Inter with even-width numbers** everywhere.
4. **A top header with a pill tab row.** An indigo pill slides under the active tab.
5. **Pages arrive softly:** the title slides up, then cards rise out of a slight blur one after another, and numbers count up.
6. **Works at every size.** The header steps down neatly, nothing scrolls sideways, and every control keeps its words.

## Read these, in order

| File | What's in it |
|---|---|
| `docs/design/look.md` | Colours (both themes), type sizes, corners, shadows, spacing, icons, logo |
| `docs/design/layout.md` | The page frame, the header and its size steps, the page grid, phones, big screens |
| `docs/design/parts.md` | Every building block with its exact sizes and behaviour |
| `docs/design/motion.md` | Every animation: timing, curve, order, drag and drop, reduced motion |
| `docs/design/rules.md` | Accessibility, words and tone, do and don't |
| `docs/design/new-site.md` | How to start a new Mycelium site: stack, kit files to copy, shell code, checks |

## The ten rules that matter most

1. Copy the kit files; never rewrite them (`new-site.md`).
2. Use tokens (`var(--accent)`), never raw colours.
3. One accent per card. One solid bar per chart.
4. Every page goes inside `<Page>`. Pages never animate themselves.
5. Ease out only. Move only `translate`, `scale`, `rotate`, `transform` and `opacity` (exceptions in `motion.md`).
6. Every control keeps its label at every width. Move it rather than shrink it to an icon.
7. No sideways page scroll. Wide things scroll inside their own box.
8. Status is never colour alone: add a word or an icon.
9. Every chart, map or picture has a table or sentence version.
10. Check 1920 to 390px, light and dark, keyboard only and reduced motion before calling it done.

## Where the look came from

- The base tokens and motion come from Reroute's "Night Dispatcher" design (`C:\dev\reroute`). Keep `choreography.js`, `reduced.js`, `motion/fm.js` and the base of `tokens.css` in step with it.
- The dashboard layer (soft ground, 24px cards, hatched bars, gauge, heatmap, insight card) comes from four reference dashboards Tristan picked on 2026-11-01.
- Page motion comes from two reference clips (2026-11-01), sped up after an animation review on 2026-11-04.
- Behaviour of small parts follows HeroUI and React Aria. The row highlight follows Aceternity. The task chip and hold button follow React Bits. The map follows ReactVibe's Node Flow. All are rebuilt on these tokens with no new library.
- The demo was reviewed with Impeccable critiques (23/40 on 2026-11-04, 28/40 on 2026-11-05). The fixes are now rules in these files.
