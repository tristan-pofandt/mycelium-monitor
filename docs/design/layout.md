# Layout: the frame, the grid, every screen size

## The frame

Every page has the same three parts, top to bottom:

1. **Header** (`.topbar`). Sticks to the top. Its ground is the page colour at 82% with a blur behind it (`saturate(1.4) blur(14px)`).
2. **Optional banner** under the header, inside the side padding: a soft accent strip (`--accent-soft`, 12px corners, 14px text) for one sentence that matters on every page. Use it for things like "this is a demo" or "a roll call is running". When something is urgent it turns `--bad-soft` with a 1px `--error` inner outline and an icon, but only for the people it is urgent for. Everyone else sees a calm line.
3. **Content** (`<main class="content" id="main">`). Padding `12px var(--gutter) 64px`. It fills the whole window width.

A "Skip to content" link sits first in the page. It hides above the screen and slides down 60px when it gets focus.

## The header

Three columns: `auto minmax(0, 1fr) auto`.

- **Left** (`.topbar-start`): the logo and name (links home), then one picker (for example "Viewing as" or "App").
- **Middle** (`.pills`): the tab row. A pill-shaped bar on `--bg-card` with icon-and-word tabs. One accent pill slides under the active tab.
- **Right** (`.topbar-end`): small things first (status pill, search, theme button), then the tools as labelled buttons (`.button.tool-link`).

The header gets narrower in steps. **Every control keeps its words at every width.** Never turn a labelled button into a bare icon to save room. Move it instead.

| Window width | What changes |
|---|---|
| over 1600px | Everything on one row |
| 1600px and under | The tab row drops to its own second row, centred |
| 1320px and under | The search button's keyboard hint hides. Extra non-app buttons (like Feedback) can move into the banner |
| 960px and under | Tools leave the right side and join the end of the tab row (`.pill-tool`) |
| 760px and under | The word next to the logo hides. Header padding is `10px 16px`. The picker may shrink and cut its text with "…" |

When the tab row is too long it scrolls sideways (no scroll bar). Its right end fades out **only while tabs are hidden past it** (`.has-more`, set by `useMoreTabs`). The active tab scrolls into view on every page change.

## The page grid

Every page is one grid, made by `<Page>` (`web/src/Page.jsx`). Pages never build their own outer layout.

```css
.page-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 16px; }
```

- Cards fill columns of at least 380px. Wider screens get more columns. Cards never stretch into one long line.
- These take a **full row** on their own: the page title, the greeting, the KPI row, notices, and any card that holds a table, a chart, a map, a calendar week or a board.
- `.span-2` makes one card two columns wide (900px and wider only).
- **A card alone on its row should span the full row.** A lone card stopping at one third of the width looks broken.
- The page title is an `h1` with an optional scope after it in muted 17px (for example "Costs  All apps").
- The home page starts with a greeting instead of a title: "Good morning", then one line of state with a badge.

Groups inside the grid:
- `.kpis`: KPI tiles, `repeat(auto-fit, minmax(200px, 1fr))`, gap 16px (140px and 10px on phones).
- `.stats`: small stat boxes, `minmax(180px, 1fr)`, gap 12px (two columns on phones).

## Phones and touch (760px and under)

- No sideways scroll on the page, ever. Wide things (tables, calendar weeks, plans) scroll inside their own box.
- Cards: 16px padding, 20px corners.
- Two-column lists (label then value) become one column.
- Card heads wrap. Toolbars and their selects shrink and wrap.
- On touch screens (`pointer: coarse`), chips and tags are at least 36-40px tall. Rows you tap are at least 48px tall.
- Put the most important thing first. If a page has a list and a picture of the same data, the list comes first on a phone.

## Long pages

If a page gets very long (over about three screens on a phone), fold the less important parts into a disclosure (`<details>`), or add in-page links. Do not let one card take over a page.

## Big-screen mode (wall TVs)

For a screen people read from across a room, drop the header and use a separate full-screen view (`.tv`). It is always dark. Its type grows with the window. At 1920px wide:

| Role | Size | Token |
|---|---|---|
| Labels | 24px | `--tv-label: clamp(15px, 1.25vw, 34px)` |
| Body | 28px | `--tv-body: clamp(18px, 1.46vw, 40px)` |
| Headings | 56px | `--tv-h: clamp(28px, 2.92vw, 80px)` |
| Big numbers | 96px | `--tv-kpi: clamp(52px, 5vw, 136px)` |

Padding is `clamp(16px, 2.4vw, 64px)`. Show nothing personal on a wall screen.
