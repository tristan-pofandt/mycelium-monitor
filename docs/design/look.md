# Look: colours, type, shapes

The exact values live in `web/src/tokens.css`. Always use the token name (`var(--accent)`), never a raw colour. The only raw colour allowed is white text (`#fff`) on the accent or the insight card.

## The feeling

- Calm and quiet. Big soft cards on a plain ground. Lots of space.
- One colour does the pointing: indigo. Everything else is grey.
- Green, amber and red show up only when they mean something (good, careful, bad).
- Dark theme is the default. Light theme follows the computer's setting, or the theme button in the header.

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
| `--series-1` / `--series-2` | `#6366f1` / `#0d9488` | `#4f46e5` / `#0d9488` | Chart series |
| `--insight-a` → `--insight-b` | `#4f46e5` → `#7c3aed` | same | The one insight card |
| `--hatch`, `--hatch-line`, `--gauge-off`, `--heat-0..4` | | | Chart fills |
| `--shadow-card` | thin inner highlight | `0 1px 2px` + `0 8px 28px`, ink 4-5% | Every card |

Rules:
- **One accent.** Indigo marks the one active or chosen thing. Do not add a second accent colour.
- **Light mode gets darker steps.** Dark-mode green, amber and red are too pale on white. Light mode swaps in the darker values above so text reaches 4.5:1. Amber badge text in light mode mixes 85% warning with 15% text on a 10% tint.
- **Never colour alone.** Every coloured status also has a word or an icon.

## Type

Font: **Inter Variable** (`@fontsource-variable/inter`), then Inter, system-ui. All numbers use tabular figures (set once on `body`). Code and IDs use `ui-monospace` at 12.5px.

| Role | Size | Weight | Letter spacing |
|---|---|---|---|
| Page title | 30px (26px under 760px) | 600 | -0.03em |
| Page scope (after the title) | 17px, muted | 500 | -0.01em |
| Big number (gauge) | 32px | 600 | -0.03em |
| KPI number | 28px (22px under 760px) | 600 | -0.03em |
| Stat number | 26px | 600 | -0.02em |
| Insight sentence | 19px | 500 | -0.01em |
| Card title | 17px | 600 | -0.01em |
| Body | 15px | 400 | |
| Buttons, tabs, tables | 14px | 500 | |
| Captions, labels | 13px, muted | 400 | |
| Tiny labels (axes, legends) | 11-12px, muted | 400-600 | |

## Shapes

| Thing | Corner radius |
|---|---|
| Tabs, buttons, badges, chips, fields in the header, segmented controls | 999px (pill) |
| Command palette and dialogs | 28px |
| Cards and KPI tiles | 24px (20px under 760px) |
| Maps, previews, stats | 20px |
| Popovers, toasts | 16px |
| Text fields, notices, KPI icon box, tooltips | 12px |
| Rows inside cards | 10px |
| Small tags | 6px |
| Bars | 8px; heatmap cells 3px; uptime days 4px |

Round arrow links are 34px circles. Header icon buttons are 40px circles.

## Depth

- Shallow. In dark mode, depth comes from tone: void, then base, then card, then pop get lighter. Cards have a 1px border and `--shadow-card`.
- Only floating things get a real shadow: tooltips `0 8px 24px rgba(0,0,0,.18)`, popovers and toasts `0 16px 40px rgba(0,0,0,.2)`, the palette `0 24px 64px rgba(0,0,0,.3)`.
- No hard offset shadows.

## Space

- Gap between cards: 16px everywhere (10px between KPI tiles on phones).
- Card padding: 24px (16px under 760px). KPI tile padding: 18px.
- Page side padding (`--gutter`): `clamp(16px, 2.4vw, 44px)`.

## Icons and logo

- One small icon set, drawn in `web/src/icons.jsx`: 16px grid, 1.75 stroke, round ends, no fill, `currentColor`. Icons are decoration; the words next to them carry the meaning (`aria-hidden`).
- Add a new icon as a new path in that file in the same style. No icon library.
- Logo: an indigo circle with three white lines meeting at a white dot (hyphae meeting at a node), from `Logo` in `icons.jsx`. Next to it, the word "Mycelium" at 17px, weight 650.
