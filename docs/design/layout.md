# Layout: the frame, the grid, every screen size

## The frame

Every page has the same three parts, top to bottom:

1. **Header** (`.topbar`). Sticks to the top. Padding `14px var(--gutter)`, 16px between columns. Its ground is the page colour at 82% with a blur behind it (`saturate(1.4) blur(14px)`).
2. **Optional banner** under the header, inside the side padding (`margin: 0 var(--gutter) 8px`): a soft accent strip (`--accent-soft`, 12px corners, padding `8px 8px 8px 16px`, 14px text, line height 1.5) for one sentence that matters on every page. Its buttons sit on the right (padding `6px 14px`, 6px apart) and wrap under the sentence when short of room. Use it for things like "this is a demo" or "a roll call is running". When something is urgent it turns `--bad-soft` with a 1px `--error` inner outline and an icon, but only for the people it is urgent for. Everyone else sees a calm line.
3. **Content** (`<main class="content" id="main" tabIndex={-1}>`). Padding `12px var(--gutter) 64px` (`8px 16px 48px` under 760px). It fills the whole window width.

A "Skip to content" link sits first in the page: an accent box (12px corners, padding `10px 14px`, white text, 12px from the left). It hides 48px above the screen and slides down 60px in 150ms when it gets focus.

The header is about 128px tall when the tabs sit on their own row. Anything a link scrolls to needs `scroll-margin-top` of about 140px, and sticky things inside the page sit at `top: 144px`.

## The header

Three columns: `auto minmax(0, 1fr) auto`.

- **Left** (`.topbar-start`, 12px gap): the logo and name (links home), then one picker (for example "Viewing as" or "App"), at most 260px wide.
- **Middle** (`.pills`): the tab row. A pill-shaped bar on `--bg-card` with icon-and-word tabs. One accent pill slides under the active tab.
- **Right** (`.topbar-end`, 8px gap): small things first (status pill, search, theme button), then the tools as labelled buttons (`.button.tool-link`).

The header gets narrower in steps. **Every control keeps its words at every width.** Never turn a labelled button into a bare icon to save room. Move it instead.

| Window width | What changes |
|---|---|
| over 1600px | Everything on one row |
| 1600px and under | The tab row drops to its own second row, centred |
| 1320px and under | The search button's keyboard hint hides. Extra non-app buttons (like Feedback) can move into the banner |
| 960px and under | Tools leave the right side and join the end of the tab row (`.pill-tool`) |
| 760px and under | Columns become `minmax(0, 1fr) auto`. The word next to the logo hides. Header padding is `10px 16px`, gaps 10px (6px on the right). The picker may shrink and cut its text with "…". More header buttons may move into the banner, which goes to 13px text and `10px 12px` padding, with its buttons at least 40px tall |

**Tabs never get cut off.** When they don't all fit, the ones that don't fit move into a **More** button at the end of the row (`TabRow` in `shell.jsx`). The tabs that fit stay in order from the left. The active tab always stays in the row: if it would not fit, it takes the last place and the tab before it moves into More. This is worked out again whenever the row changes width.

## The page grid

Every page is one grid, made by `<Page>` (`web/src/Page.jsx`). Pages never build their own outer layout.

```css
.page-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 16px; }
```

- Cards fill columns of at least 380px. Wider screens get more columns. Cards never stretch into one long line.
- These take a **full row** (`grid-column: 1 / -1`): the page title, the greeting, the KPI row, notices, the insight card, the intro strip, and any card that holds a table, a chart, a map, a calendar week or a board.
- `.span-2` makes one card two columns wide (900px and wider only).
- **A card alone on its row should span the full row.** A lone card stopping at one third of the width looks broken.
- The page title (`.page-head`, margin `8px 0 4px`) is an `h1` with an optional scope 10px after it in muted 17px (for example "Costs  All apps").
- The home page starts with a greeting instead of a title: "Good morning", then one line of state 10px below (16px, weight 500, items 10px apart): a badge, a sentence, and when it was updated.

Groups inside the grid:
- `.kpis`: KPI tiles, `repeat(auto-fit, minmax(200px, 1fr))`, gap 16px (140px and 10px on phones).
- `.stats`: small stat boxes, `minmax(180px, 1fr)`, gap 12px (two columns and gap 8px on phones).
- **Side by side inside a full-row card** (a list beside a map, a document beside its fields): use `minmax(0, …fr)` columns and drop to one column under about 1100px.

## Phones and touch (760px and under)

- No sideways scroll on the page, ever. Wide things (tables, calendar weeks, plans) scroll inside their own box.
- Cards: 16px padding, 20px corners.
- Two-column lists (label then value) become one column.
- Card heads wrap. Toolbars and their selects shrink and wrap (`min-width: 0; max-width: 100%`, text cut with "…").
- Text inputs people type in on a phone use 16px text, so the phone does not zoom in.
- On touch screens (`pointer: coarse`), chips are at least 40px tall and tags 36px. Rows you tap are at least 48px tall. Hover looks on things people tap (map objects, grid cells) go under `@media (hover: hover)`, so a tap never leaves one stuck.
- Put the most important thing first. If a page has a list and a picture of the same data, the list comes first on a phone.

## Long pages

If a page gets very long (over about three screens on a phone), fold the less important parts into a disclosure (`<details>`), or add in-page links. Do not let one card take over a page.

## Big-screen mode (wall TVs)

For a screen people read from across a room, drop the header and use a separate full-screen view (`.tv`). It sets dark while open and puts the old theme back on leaving. Its type grows with the window (line height 1.3). At 1920px wide:

| Role | Size | Token |
|---|---|---|
| Labels | 24px | `--tv-label: clamp(15px, 1.25vw, 34px)` |
| Body | 28px | `--tv-body: clamp(18px, 1.46vw, 40px)` |
| Headings | 56px | `--tv-h: clamp(28px, 2.92vw, 80px)` |
| Big numbers | 96px | `--tv-kpi: clamp(52px, 5vw, 136px)` |

Padding is `clamp(16px, 2.4vw, 64px)`; gaps are `clamp(16px, 2vw, 48px)`. Rows are split by `--border-strong` lines. Show nothing personal on a wall screen.
