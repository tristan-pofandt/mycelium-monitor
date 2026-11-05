# Parts: every building block

The CSS for the parts marked **(kit)** is in `web/src/app.css` and their code is in the kit files (see `new-site.md`). Copy them; do not redraw them. Parts marked **(pattern)** are recipes: build them from tokens exactly as written here.

## Header parts (kit)

- **Tab row** (`.pills`): a pill bar on `--bg-card` with a border and card shadow, 4px inside padding, 2px between tabs. Each tab (`.pill`) is icon plus word, 14px, weight 500, padding `8px 14px`, muted grey. Hover turns the text white-ish on `--bg-pop`. The active tab has white text on the sliding accent pill (`.pill-indicator`). Arrow keys, Home and End move between tabs.
- **Picker** (`Picker` in `ui.jsx`): a 40px pill button with a label and a chevron. The chevron turns upside down when open. The list (`.popover`) is a 16px-corner box on `--bg-card`, 6px padding, rows of 14px text. Arrows, Home, End and typing a letter move. Enter or Space chooses. Escape, Tab or a click outside closes and focus goes back to the button.
- **Icon button** (`.icon-button`): a 40px circle on `--bg-card` with a border and card shadow. Always has a tooltip and an `aria-label`. Use it only for the theme button and search. Everything else gets a word.
- **Tool button** (`.button.tool-link`): a normal pill button with an icon and a word. Active tool: accent border and accent text.
- **Status pill**: a 40px tall badge on `--bg-card` showing the overall state in a word ("Healthy", "Down").

## Cards (kit)

- **Card** (`.card` or `.panel-card`): `--bg-card`, 1px border, card shadow, 24px corners, 24px padding.
- **Card head** (`.card-head`): title (17px, 600) and a muted 13px subtitle (`.card-sub`) on the left; tools on the right (`.card-tools`: segmented control, round arrow link). 16px below it.
- **Round arrow link** (`.round-link`): a 34px circle with a strong border and an arrow. It opens the full page for that card. Always has a tooltip.
- **KPI tile** (`KpiTile` in `charts.jsx`): a 40px outlined icon box top left (12px corners, 1.5px border), a round arrow link top right, then the number (28px), the label (13px muted), then a change pill. The number counts up.
- **Change pill** (`Delta`, `.delta`): a small pill with an arrow icon and a signed percent. Good: `--good-soft` and green. Bad: `--bad-soft` and red. No change: `--bg-pop` and muted, "No change". Screen readers hear the full phrase.
- **Stat** (`Stat`, `.stat`): a 20px-corner box, 16px padding, label (13px muted), number (26px), note.
- **Insight card** (`.insight`): the one colourful card. A radial gradient from `--insight-b` (top right) to `--insight-a`, white text at 19px weight 500, and a spark icon in a see-through white circle. The sentence must come from real numbers. If there is nothing worth saying, do not show the card. At most one per page.
- **Notice** (`.notice`): `--bg-pop`, 12px corners, `12px 16px` padding. One short message.
- **Empty state** (`EmptyState`): a 42px icon tile, a bold title, one muted line, and maybe one button. Say what will show up here and how.
- **Loading** (`Skeleton`): `--bg-pop` blocks with a soft shimmer every 1.6s. Off under reduced motion.

## Buttons and controls (kit)

- **Button** (`.button`): pill, `--bg-card`, strong border, 14px weight 500, padding `8px 16px`. Hover: `--bg-pop`. Press: shrinks to 0.97.
- **Primary** (`.button-primary`): accent fill, white text. Hover brightens 10%. One per card at most.
- **Danger** (`.button-danger`): red text. For anything you cannot undo, use the **hold button** (`HoldButton`): hold the mouse, Space or Enter for 1.2s. A fill grows across the button. Let go early and it unwinds.
- **Saving button**: shows a spinner while working, then turns green with "Saved".
- **Segmented control** (`.segmented`): a pill track on `--bg-pop` with small buttons. The chosen one lifts onto `--bg-card` with a shadow. Use it to switch views (24h / 7d / 30d).
- **Chips** (`.chip`): 30px pills with a strong border, 13px. As toggles they use `aria-pressed`; off chips are dimmed and struck through.
- **Switch** (`Switch`): 44 by 26px track, white 20px thumb. Accent when on. Has `role="switch"`.
- **Text field** (`.input`): `--bg-surface`, strong border, 12px corners, `9px 12px` padding, 14px. Focus: 2px accent outline.
- **Check box**: 18px with `accent-color: var(--accent)`.
- **Link in text**: accent text, weight 500, no underline until hover. Never browser blue.

## Status words (kit)

- **Badge** (`.badge`): a pill on `--bg-pop` with an icon and a word, 13px weight 500. Tinted versions: `.badge-ok` (green on `--good-soft`), `.badge-warn` (amber on a 16% amber tint), `.badge-bad` (red on `--bad-soft`), `.badge-none` (muted icon).
- **Kind pill** (`.kind`): a 12px pill on `--bg-pop` whose text colour says the kind (teal, accent, orange, red). The word always shows.
- **Task chip** (`TaskChip` in `tasks.jsx`): shows one action you started. States: queued, running, done, failed, cancelled, each with an icon, a word and seconds. Running: a soft fill moves toward 90% and waits. Done: snaps full and turns green. Failed: stops, shakes once, turns red, shows why and offers Retry.
- **Progress bar** (`.progress`): 8px tall pill on `--gauge-off`, accent fill.

## Lists and tables (kit)

- **Rows in a card** (`.activity`, `.queue`, `.app-list`): 1px `--border` lines between rows, 10px padding. A soft `--bg-pop` highlight slides between rows under the mouse (`useRowHighlight`).
- **Table** (`Table` in `charts.jsx`): 14px, row lines, a 12px muted header row, rows tint to `--bg-pop` on hover. Headers are sort buttons with a faint sort icon. Wide tables scroll inside `.table-wrap`. An empty table shows an empty state.
- **Label and value list** (`.facts`): two columns (`max-content 1fr`), muted labels. One column on phones.
- **Disclosure rows** (pattern): a `<details>` row whose `summary` is a grid (badge, name, short reason, time, chevron). Hover: `--bg-pop`, 10px corners. The chevron turns over when open. Inside: items as `--bg-pop` tiles with 12px corners.

## Charts (kit)

Every chart has a "Show as table" disclosure (`.table-toggle`) or a sentence that says the same thing.

- **Bars** (`Bars`): columns with 8px corners. All bars are hatched (135° stripes of the series colour at 14% and 26%) except one, which is solid: the hovered bar, or the latest. Dashed gridlines. A one-line tooltip pill sits above the focused bar. Stacked parts have 3px gaps. Never make every bar solid.
- **Gauge** (`Gauge`): an arc of round-ended segments, 6.5 stroke. On segments are accent, off are `--gauge-off`. The number sits in the middle at 32px. It has `role="img"` and a label.
- **Heatmap** (`Heatmap`): a day-by-hour grid of 3px-corner cells in five steps (`--heat-0` to `--heat-4`), with a "Less … More" legend.
- **Uptime strip** (`.uptime`): one 34px bar per day, 2px apart, green, amber, red or empty.
- **Legend** (`.legend`): 10px swatches with 3px corners, 13px muted words.

## Floating things (kit)

- **Tooltip** (`Tip`): a dark pill (light text on `--text`), 12.5px, 10px corners. Opens after 500ms on hover or focus. Once one has been open, the next opens at once for 400ms. Escape closes it.
- **Toast** (`useToast`): bottom right, 16px corners, icon, one line, maybe one action like Undo, and a close button. Stays 4s and pauses while hovered or focused. At most three. Alt+T jumps to the newest.
- **Command palette** (`.palette`): a `<dialog>` 560px wide, 28px corners, 12vh from the top, dimmed backdrop. Big search field, list below. Ctrl+K opens it.
- **Dialog** (pattern): the same `.palette` box, up to 620px wide, at most the screen height minus 48px, 8vh from the top, scrolls inside, 22px padding. Clicking the backdrop closes it.

## Bigger patterns

Build these from tokens exactly as described. Mycelium Ops has working examples in `web/src/demo/`.

- **Intro strip** (`.start-strip`): a full-width card with a 35% accent border. Title and one line on the left, two or three buttons on the right. Shows on a first visit and can be hidden for good.
- **Quick note box** (`.fb-card`): a full-width card with a dashed border at the bottom of a page. One line until clicked, then it grows. After sending, a green `--good-soft` thank-you replaces it.
- **Guess tag** (`.assumed`): dashed outline and a tiny uppercase tag for a value that is a guess. When someone confirms it, the outline turns solid green. Use it for any value that is not yet known for sure.
- **Calendar week** (`.week`): seven columns of at least 120px on `--bg-surface` trays. Events are small cards (`--bg-card`, 6px corners) with a coloured dot for the type, a time, a title and small lock or state chips. Waiting events have a dashed border. Press: 0.98.
- **Rules legend**: when small chips carry meaning, explain them once in a legend strip above the list, not on every item.
- **Plan or map canvas**: drawn on `--bg-void` with 20px corners. Areas are `--bg-card` shapes. Each kind of object has its own shape. A problem is red and has a word. The accent ring means only focus, selection or highlight. Labels have a halo in the card colour. On phones the canvas keeps its size and pans inside its own frame.
- **Document tray**: a paper-like card (`--bg-card`) on a `--bg-pop` tray, with a heavy line under its header and a dashed box around quoted text. Notes about it sit on `--bg-pop` with a 3px coloured left line.
- **Edit mode for cards**: a "Customise" button turns it on. Each card gets a tool row above it on `--bg-pop` (drag handle, Move up, Move down, Wide, Hide; 36px buttons). Card content dims to 72% and stops responding. Cancel, Reset and Done sit in a bar at the top.
- **Urgent mode**: when something urgent runs, the banner turns red (see `layout.md`), action rows are at least 48px tall, the person's name is in each button's label, and nothing animates.
