# Rules: access, words, do and don't

## Everyone can use it

- **Every picture has words.** Every chart has a "Show as table" or a sentence. Gauges have `role="img"` and a label. Purely decorative drawings are `aria-hidden`. Every map or plan has a list or table that holds the same facts.
- **Never colour alone.** Every status has a word, and usually an icon too.
- **Every control works with a keyboard.** Tab gets there; Enter or Space uses it; Escape closes things. In rows of tabs or buttons, Left and Right also move and Home and End jump to the ends (`rovingKeys`). A big map or plan is one Tab stop; those same keys move between its objects, and Enter or Space opens one. A grid of cells is one Tab stop too: all four arrows move, Home and End go to the row's ends, Ctrl+Home and Ctrl+End to the corners.
- **Focus is easy to see:** a 2px `--accent-text` outline, 2px away from the edge, 6px corners (`:focus-visible`, set once in `tokens.css`). Text fields, grid cells and guess tags use a 2px `--accent` outline 1px away.
- **Things that change are announced.** Toasts and counters use polite live regions. Do not announce more than once every 5s. A wall screen announces nothing.
- **Contrast:** text reaches 4.5:1 on its background in both themes. Use the light-mode colour steps in `look.md`.
- **Touch:** see the touch sizes in `layout.md`.
- **Reduced motion:** see `motion.md`.
- First thing on every page: a "Skip to content" link.

## Words

- Plain, short and friendly. Write like you are explaining it to a new staff member. No jargon.
- Sentence case everywhere ("Show as table", not "Show As Table").
- Every button says what it does with a verb ("Approve", "Request a day off"). Every control keeps its label at every screen size.
- Say the real number and the real time ("Updated 2 min ago", "3 of 40 answered").
- Empty states say what will show up here and how to get it.
- Never overclaim. Say "Evidence found" or "Gap", not "Compliant". A guess is marked as a guess.
- Do not invent data. Numbers, insights and states come from real data (or clearly fictional demo data).
- Do not repeat yourself: explain a set of chips or tags once in a legend, not on every item.
- Times and money use tabular figures. Spell out what a short form means for screen readers.

## Do

- Use `var(--token)` for every colour, size of corner and shadow.
- Copy the kit files; do not rewrite them.
- Use the shared parts (`Page`, `Picker`, `Tip`, `Table`, `KpiTile`, …) before making a new one.
- When you add a themed token, add it to both light blocks in `tokens.css`.
- Keep one solid bar per chart and one accent per card.
- Give each feature's own CSS its own file next to it (`roster.css`, `weather.css`, …).
- Check every page at 1920, 1600, 1440, 1280, 1024, 960, 900, 760 and 390px, in light and dark, and with the keyboard only.

## Don't

- Don't add a second accent colour or a solid-filled bar chart.
- Don't animate size or position properties, and don't use ease-in.
- Don't use hard offset shadows.
- Don't use dark-mode status colours on light backgrounds.
- Don't turn labelled buttons into icon-only buttons on small screens. Move them instead.
- Don't let the page scroll sideways.
- Don't add an icon library, a UI kit or a CSS framework. Everything is drawn from these tokens.
- Don't put a pop-up "Are you sure?" (`confirm()`) on a destructive action. Use the hold button, and offer Undo where you can.
