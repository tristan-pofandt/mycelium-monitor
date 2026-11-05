# Look: colours, type, shapes

The exact values live in `web/src/tokens.css`. Always use the token name (`var(--accent)`), never a raw colour. The only raw colour allowed is white (`#fff`): text on the accent or the insight card, the switch thumb and the logo lines.

## The feeling

- Calm and quiet. Big soft cards on a plain ground. Lots of space.
- One colour does the pointing: indigo. Everything else is grey.
- Green, amber and red show up only when they mean something (good, careful, bad).
- The theme follows the computer's setting (dark when it has none) until someone picks one with the theme button in the header. The pick is remembered in this browser.

## Colours

Each token has a dark value and a light value. The light values are in `tokens.css` twice (inside the `prefers-color-scheme: light` media query and under `:root[data-theme="light"]`). Change both together.

| Token | Dark | Light | Use it for |
|---|---|---|---|
| `--bg-void` | `#06070b` | `#e7e9f0` | Behind maps and plans |
| `--bg-base` | `#08090d` | `#f1f2f6` | The page ground |
| `--bg-surface` | `#111319` | `#ffffff` | Text fields, inner trays |
| `--bg-card` | `#121419` | `#ffffff` | Cards, buttons, pill row |
| `--bg-pop` | `#1b1e27` | `#f5f6fa` | Hover, badges, rows inside cards |
| `--border` | white 7% | ink 7% | Card edges, row lines |
| `--border-strong` | white 13% | ink 14% | Buttons, fields, popovers |
| `--text` | `#f1f5f9` | `#0f1222` | Main text |
| `--text-muted` | `#94a3b8` | `#475569` | Labels, captions, help |
| `--text-faint` | `#64748b` | `#64748b` | Dashed outlines, quiet dots |
| `--accent` | `#575af0` | `#4f46e5` | Active tab, primary button, focus bar, gauge |
| `--accent-text` | `#a5b4fc` | `#4338ca` | Links and accent words |
| `--accent-soft` | indigo 16% | indigo 10% | Selected things, soft highlight |
| `--success` | `#34d399` | `#047857` | Good, up, done |
| `--warning` | `#fbbf24` | `#b45309` | Careful, soon, short |
| `--error` | `#f87171` | `#b91c1c` | Bad, down, failed |
| `--good-soft` / `--bad-soft` | 14% tints | 10% / 9% tints | Behind good or bad badges and rows |
| `--teal` `--orange` `--violet` | `#2dd4bf` `#fb923c` `#a78bfa` | `#0f766e` `#c2410c` `#6d28d9` | Kinds of things (event types, map lines) |
| `--ev-read` `--ev-write` `--ev-external` `--ev-error` | | | Event kinds: teal, `--accent-text`, orange, `--error` |
| `--series-1` / `--series-2` | `#6366f1` / `#0d9488` | `#4f46e5` / `#0d9488` | Chart series |
| `--insight-a` → `--insight-b` | `#4f46e5` → `#7c3aed` | same | The one insight card |
| `--hatch`, `--hatch-line`, `--gauge-off`, `--heat-0..4` | | | Chart fills |
| `--shadow-card` | thin inner highlight | `0 1px 2px` + `0 8px 28px`, ink 4-5% | Every card |

Rules:
- **One accent.** Indigo marks the one active or chosen thing. Do not add a second accent colour.
- **Light mode gets darker steps.** Dark-mode green, amber and red are too pale on white. Light mode swaps in the darker values above so text reaches 4.5:1. Amber badge text in light mode mixes 85% warning with 15% text on a 10% tint.
- **Never colour alone.** Every coloured status also has a word or an icon.

## Type

Font: **Inter Variable** (`@fontsource-variable/inter`), then Inter, system-ui. All numbers use tabular figures (set once on `body`). IDs (`.mono`) use `ui-monospace` at 12.5px. Inline `code` is 13px on `--bg-pop` with 6px corners.

| Role | Size | Weight | Letter spacing |
|---|---|---|---|
| Page title | 30px (26px under 760px) | 600 | -0.03em |
| Page scope (after the title) | 17px, muted | 500 | -0.01em |
| Big number (gauge) | 32px | 600 | -0.03em |
| Greeting state line | 16px | 500 | |
| KPI number | 28px (22px under 760px) | 600 | -0.03em |
| Stat number | 26px | 600 | -0.02em |
| Insight sentence | 19px | 500 | -0.01em |
| Card title | 17px | 600 | -0.01em |
| Body | 15px | 400 | |
| Buttons, tabs | 14px | 500 | |
| Tables, form labels | 14px | 400 | |
| Captions, labels | 13px, muted | 400 | |
| Small pills (change pill, kind pill) | 12px | 500-600 | |
| Tiny labels (axes, legends) | 11-12px, muted | 400-600 | |

## Shapes

Use the radius tokens where they exist.

| Thing | Corner radius |
|---|---|
| Tabs, buttons, selects, badges, chips, segmented controls, header pickers | 999px (pill) |
| Command palette and dialogs | 28px (`--r-sheet`) |
| Cards, KPI tiles, the insight card | 24px (`--r-panel`). Cards drop to 20px under 760px; KPI tiles stay 24px |
| Maps, previews, stats, skeletons, chat bubbles | 20px (`--r-card`) |
| Popovers, toasts | 16px |
| Choice tiles, empty-state icon tile | 14px (`--r-control`) |
| Text fields, notices, KPI icon box, chart tooltip, tinted tiles inside cards | 12px (`--r-field`) |
| Rows inside cards, popover rows, trays, hover tooltips | 10px (`--r-tile`) |
| Small tags, calendar events, focus ring | 6px (`--r-tag`) |
| Bars | 8px; heatmap cells and legend swatches 3px; uptime days 4px (2px on phones) |

Round arrow links are 34px circles. Header icon buttons are 40px circles.

## Depth

- Shallow. In dark mode, depth comes from tone: void, then base, then card, then pop get lighter. Cards have a 1px border and `--shadow-card`.
- Only floating things get a real shadow: the chart tooltip `0 8px 24px rgba(0,0,0,.18)`, popovers `0 16px 40px rgba(0,0,0,.22)`, toasts `0 16px 40px rgba(0,0,0,.2)`, the palette `0 24px 64px rgba(0,0,0,.3)`. A dragged thing adds `0 8px 20px rgba(0,0,0,.18)` to `--shadow-card`. Hover tooltips have no shadow.
- No hard offset shadows.

## Space

- Gap between cards: 16px everywhere (10px between KPI tiles on phones).
- Card padding: 24px (16px under 760px). KPI tile padding: `18px 18px 16px` (14px under 760px).
- Page side padding (`--gutter`): `clamp(16px, 2.4vw, 44px)`.

## Icons and logo

- One small icon set, drawn in `web/src/icons.jsx`: 16px grid, 1.75 stroke, round ends, no fill, `currentColor`. Icons are decoration; the words next to them carry the meaning (`aria-hidden`).
- Add a new icon as a new path in that file in the same style. No icon library.
- Logo: a 30px indigo circle with three white lines meeting at a white dot, each line ending in a smaller dot (hyphae meeting at a node), from `Logo` in `icons.jsx`. 10px to its right, the word "Mycelium" at 17px, weight 650, -0.02em.
